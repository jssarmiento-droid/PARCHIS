import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { FinalReport, PlayerColor, Prisma, TileType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

type CreateGamePayload = {
  bluePlayer: string;
  redPlayer: string;
  greenPlayer?: string;
  yellowPlayer?: string;
  questionIds?: string[];
};

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.gameSession.findMany({
      orderBy: { createdAt: 'desc' },
      include: { players: true, selectedQuestions: { include: { question: true }, orderBy: { order: 'asc' } }, finalReport: true },
    });
  }

  async findOne(id: string) {
    const game = await this.prisma.gameSession.findUnique({
      where: { id },
      include: {
        players: true,
        selectedQuestions: { include: { question: { include: { audio: true } } }, orderBy: { order: 'asc' } },
        movements: { orderBy: { createdAt: 'desc' } },
        answers: true,
        finalReport: true,
      },
    });
    if (!game) throw new NotFoundException('Partida no encontrada');
    return game;
  }

  async getActiveGame() {
    return this.prisma.gameSession.findFirst({
      where: { status: { in: ['CREATED', 'RUNNING', 'PAUSED'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        players: true,
        selectedQuestions: { include: { question: { include: { audio: true } } }, orderBy: { order: 'asc' } },
        movements: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
  }

  async create(payload: CreateGamePayload) {
    if (!payload.questionIds?.length) {
      throw new BadRequestException('Selecciona al menos una pregunta para la partida');
    }

    const activeGame = await this.prisma.gameSession.findFirst({
      where: { status: { in: ['CREATED', 'RUNNING', 'PAUSED'] } },
      select: { publicId: true },
    });
    if (activeGame) {
      throw new ConflictException(`Ya existe una partida activa: ${activeGame.publicId}`);
    }

    const activeQuestionCount = await this.prisma.question.count({
      where: { id: { in: payload.questionIds }, status: true },
    });
    if (activeQuestionCount !== payload.questionIds.length) {
      throw new BadRequestException('Una o más preguntas seleccionadas no existen o están inactivas');
    }

    const publicId = await this.nextPublicId();
    const players = [
      { color: 'BLUE' as const, name: payload.bluePlayer, currentTile: 4 },
      { color: 'RED' as const, name: payload.redPlayer, currentTile: 9 },
      ...(payload.greenPlayer ? [{ color: 'GREEN' as const, name: payload.greenPlayer, currentTile: 14 }] : []),
      ...(payload.yellowPlayer ? [{ color: 'YELLOW' as const, name: payload.yellowPlayer, currentTile: 19 }] : []),
    ];
    const systemConfig = await this.prisma.systemConfig.findFirst();
    const maxPlayers = systemConfig?.playerCount || 4;
    if (players.length > maxPlayers) {
      throw new BadRequestException(`La configuración permite un máximo de ${maxPlayers} jugadores`);
    }

    return this.prisma.gameSession.create({
      data: {
        publicId,
        players: { create: players },
        selectedQuestions: {
          create: payload.questionIds.map((questionId, index) => ({
            order: index + 1,
            question: { connect: { id: questionId } },
          })),
        },
      },
      include: { players: true, selectedQuestions: { include: { question: true }, orderBy: { order: 'asc' } } },
    });
  }

  async startGame(id: string) {
    const current = await this.prisma.gameSession.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Partida no encontrada');
    if (current.status === 'RUNNING') return this.findOne(id);
    if (current.status !== 'CREATED' && current.status !== 'PAUSED') {
      throw new ConflictException('La partida ya fue finalizada o cancelada');
    }
    return this.prisma.gameSession.update({
      where: { id },
      data: { status: 'RUNNING', startedAt: new Date() },
      include: { players: true },
    });
  }

  async finishGame(id: string) {
    const game = await this.findOne(id);
    if (game.status === 'FINISHED' && game.finalReport) return game.finalReport;
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

  async processDeviceEvent(payload: Record<string, unknown>) {
    const eventId = this.eventId(payload);
    if (eventId) {
      const existing = await this.prisma.moveHistory.findUnique({ where: { eventId } });
      if (existing) {
        const state = await this.findOne(existing.gameId);
        return { state, movement: existing, finalReport: state.finalReport };
      }
    }

    const game = payload.gameId ? await this.findOne(String(payload.gameId)) : await this.getActiveGame();
    if (!game) throw new NotFoundException('No existe partida activa');

    const color = this.normalizeColor(typeof payload.color === 'string' ? payload.color : undefined);
    const player = game.players.find((item) => item.color === color);
    const diceValue = Number(payload.diceValue || payload.dice || 0) || null;
    const tileType = this.normalizeTileType(typeof payload.tileType === 'string' ? payload.tileType : undefined);
    const isCorrect = typeof payload.isCorrect === 'boolean' ? payload.isCorrect : undefined;
    const eventName = String(payload.eventName || 'esp32:game-event');
    if (eventName === 'game_started' && game.status === 'CREATED') {
      await this.prisma.gameSession.update({
        where: { id: game.id },
        data: { status: 'RUNNING', startedAt: new Date() },
      });
    }
    const isAnswerEvent = typeof isCorrect === 'boolean'
      && (Boolean(payload.questionId) || ['answer', 'response', 'question_answered'].includes(eventName));

    const reportedScore = Number(payload.educationalScore);
    const educationalScore = Number.isFinite(reportedScore) && reportedScore >= 0
      ? reportedScore
      : player?.educationalScore || 0;
    const reportedTile = Number(payload.currentTile ?? payload.toTile);
    let toTile = Number.isFinite(reportedTile) && reportedTile >= 0
      ? reportedTile
      : player?.currentTile || 0;

    if (player && (typeof payload.currentTile !== 'undefined' || typeof payload.toTile !== 'undefined' || typeof payload.educationalScore !== 'undefined')) {
      await this.prisma.gamePlayer.update({
        where: { id: player.id },
        data: { educationalScore, currentTile: toTile },
      });
    }

    const movement = await this.prisma.moveHistory.create({
      data: {
        eventId,
        gameId: game.id,
        playerId: player?.id,
        turnNumber: Number(payload.turnNumber || payload.turn || 1),
        color,
        diceValue,
        fromTile: Number(payload.fromTile || player?.currentTile || 0),
        toTile,
        tileType,
        questionId: payload.questionId ? String(payload.questionId) : undefined,
        questionText: payload.questionText ? String(payload.questionText) : undefined,
        selectedAnswer: payload.selectedAnswer ? String(payload.selectedAnswer) : undefined,
        isCorrect,
        educationalScore,
        eventName,
        metadata: payload as Prisma.InputJsonObject,
      },
    });

    if (isAnswerEvent) {
      if (payload.selectedAnswer || payload.answer) {
        await this.prisma.answerHistory.create({
          data: {
            gameId: game.id,
            playerId: player?.id,
            questionId: payload.questionId ? String(payload.questionId) : undefined,
            selectedOption: String(payload.selectedAnswer || payload.answer),
            isCorrect: Boolean(isCorrect),
          },
        });
      }
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
    if (eventName === 'game_finished' || eventName === 'winner') {
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
    if (['START', 'FREE', 'INFORMATIVE', 'QUESTION', 'ENTRY', 'LOSE_TURN', 'REPEAT_TURN', 'GOAL'].includes(type)) return type as TileType;
    return 'FREE';
  }

  private eventId(payload: Record<string, unknown>) {
    if (typeof payload.eventId !== 'string') return undefined;
    const eventId = payload.eventId.trim();
    return eventId.length > 0 && eventId.length <= 120 ? eventId : undefined;
  }
}
