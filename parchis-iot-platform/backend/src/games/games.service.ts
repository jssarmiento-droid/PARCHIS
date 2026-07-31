import { Injectable, NotFoundException } from '@nestjs/common';
import { FinalReport, GameStatus, PlayerColor, TileType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

type CreateGamePayload = {
  bluePlayer: string;
  redPlayer: string;
  greenPlayer: string;
  yellowPlayer: string;
};

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.gameSession.findMany({
      orderBy: { createdAt: 'desc' },
      include: { players: true, finalReport: true },
    });
  }

  async findOne(id: string) {
    const game = await this.prisma.gameSession.findUnique({
      where: { id },
      include: { players: true, movements: { orderBy: { createdAt: 'desc' } }, answers: true, finalReport: true },
    });
    if (!game) throw new NotFoundException('Partida no encontrada');
    return game;
  }

  async getActiveGame() {
    return this.prisma.gameSession.findFirst({
      where: { status: { in: ['CREATED', 'RUNNING', 'PAUSED'] } },
      orderBy: { createdAt: 'desc' },
      include: { players: true, movements: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
  }

  async create(payload: CreateGamePayload) {
    const publicId = await this.nextPublicId();
    return this.prisma.gameSession.create({
      data: {
        publicId,
        players: {
          create: [
            { color: 'BLUE', name: payload.bluePlayer },
            { color: 'RED', name: payload.redPlayer },
            { color: 'GREEN', name: payload.greenPlayer },
            { color: 'YELLOW', name: payload.yellowPlayer },
          ],
        },
      },
      include: { players: true },
    });
  }

  async startGame(id: string) {
    return this.prisma.gameSession.update({
      where: { id },
      data: { status: 'RUNNING', startedAt: new Date() },
      include: { players: true },
    });
  }

  async finishGame(id: string) {
    const game = await this.findOne(id);
    const finishedAt = new Date();
    const startedAt = game.startedAt || game.createdAt;
    const durationSeconds = Math.max(0, Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000));
    const bestPlayer = [...game.players].sort((a, b) => b.educationalScore - a.educationalScore)[0];
    const winner = game.players.find((player) => player.isWinner) || bestPlayer;

    await this.prisma.gameSession.update({
      where: { id },
      data: {
        status: 'FINISHED',
        finishedAt,
        durationSeconds,
        winnerColor: winner?.color,
        bestEducationalColor: bestPlayer?.color,
        bestEducationalScore: bestPlayer?.educationalScore || 0,
      },
    });

    return this.prisma.finalReport.upsert({
      where: { gameId: id },
      update: {
        winnerColor: winner?.color,
        bestEducationalColor: bestPlayer?.color,
        totalQuestions: game.totalQuestions,
        correctAnswers: game.correctAnswers,
        incorrectAnswers: game.incorrectAnswers,
        durationSeconds,
        summary: {
          publicId: game.publicId,
          players: game.players,
          generatedAt: finishedAt,
        },
      },
      create: {
        gameId: id,
        winnerColor: winner?.color,
        bestEducationalColor: bestPlayer?.color,
        totalQuestions: game.totalQuestions,
        correctAnswers: game.correctAnswers,
        incorrectAnswers: game.incorrectAnswers,
        durationSeconds,
        summary: {
          publicId: game.publicId,
          players: game.players,
          generatedAt: finishedAt,
        },
      },
    });
  }

  async processDeviceEvent(payload: Record<string, any>) {
    const game = await this.getActiveGame();
    if (!game) throw new NotFoundException('No existe partida activa');

    const color = this.normalizeColor(payload.color);
    const player = game.players.find((item) => item.color === color);
    const diceValue = Number(payload.diceValue || payload.dice || 0) || null;
    const tileType = this.normalizeTileType(payload.tileType);
    const isCorrect = typeof payload.isCorrect === 'boolean' ? payload.isCorrect : undefined;

    let educationalScore = player?.educationalScore || 0;
    let toTile = Number(payload.currentTile || payload.toTile || player?.currentTile || 0);

    if (player && typeof isCorrect === 'boolean') {
      if (isCorrect) {
        educationalScore += 1;
        toTile = Math.min(28, toTile + 1);
      } else {
        toTile = Math.max(0, toTile - 1);
      }
      await this.prisma.gamePlayer.update({
        where: { id: player.id },
        data: { educationalScore, currentTile: toTile },
      });
    }

    const movement = await this.prisma.moveHistory.create({
      data: {
        gameId: game.id,
        playerId: player?.id,
        turnNumber: Number(payload.turnNumber || payload.turn || 1),
        color,
        diceValue,
        fromTile: Number(payload.fromTile || player?.currentTile || 0),
        toTile,
        tileType,
        questionText: payload.questionText,
        selectedAnswer: payload.selectedAnswer,
        isCorrect,
        educationalScore,
        eventName: String(payload.eventName || 'esp32:game-event'),
        metadata: payload,
      },
    });

    if (typeof isCorrect === 'boolean') {
      await this.prisma.gameSession.update({
        where: { id: game.id },
        data: {
          totalQuestions: { increment: 1 },
          correctAnswers: isCorrect ? { increment: 1 } : undefined,
          incorrectAnswers: !isCorrect ? { increment: 1 } : undefined,
        },
      });
    }

    let finalReport: FinalReport | null = null;
    if (payload.eventName === 'game_finished' || payload.eventName === 'winner') {
      if (player) await this.prisma.gamePlayer.update({ where: { id: player.id }, data: { isWinner: true } });
      finalReport = await this.finishGame(game.id);
    }

    return { state: await this.findOne(game.id), movement, finalReport };
  }

  private async nextPublicId() {
    const year = new Date().getFullYear();
    const count = await this.prisma.gameSession.count({
      where: { publicId: { startsWith: `Partida #${year}-` } },
    });
    return `Partida #${year}-${String(count + 1).padStart(3, '0')}`;
  }

  private normalizeColor(value: string | undefined): PlayerColor {
    const color = String(value || 'BLUE').toUpperCase();
    if (['BLUE', 'RED', 'GREEN', 'YELLOW'].includes(color)) return color as PlayerColor;
    return 'BLUE';
  }

  private normalizeTileType(value: string | undefined): TileType {
    const type = String(value || 'FREE').toUpperCase();
    if (['START', 'FREE', 'INFORMATIVE', 'QUESTION', 'LOSE_TURN', 'REPEAT_TURN', 'GOAL'].includes(type)) return type as TileType;
    return 'FREE';
  }
}
