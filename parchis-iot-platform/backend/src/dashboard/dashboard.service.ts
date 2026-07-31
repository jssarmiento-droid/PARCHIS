import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [games, questions, audios, players, correct, incorrect, devices] = await Promise.all([
      this.prisma.gameSession.count(),
      this.prisma.question.count(),
      this.prisma.audioAsset.count(),
      this.prisma.gamePlayer.count(),
      this.prisma.answerHistory.count({ where: { isCorrect: true } }),
      this.prisma.answerHistory.count({ where: { isCorrect: false } }),
      this.prisma.deviceStatus.findMany(),
    ]);

    const finished = await this.prisma.gameSession.findMany({
      where: { status: 'FINISHED' },
      select: { durationSeconds: true, winnerColor: true },
    });
    const averageDuration = finished.length
      ? Math.round(finished.reduce((sum, item) => sum + item.durationSeconds, 0) / finished.length)
      : 0;

    return {
      currentTime: new Date().toISOString(),
      devices,
      indicators: {
        games,
        questions,
        audios,
        averageDuration,
        historicalPlayers: players,
        answeredQuestions: correct + incorrect,
        averageCorrectRate: correct + incorrect ? Math.round((correct / (correct + incorrect)) * 100) : 0,
        winners: finished.filter((item) => item.winnerColor).length,
      },
    };
  }
}
