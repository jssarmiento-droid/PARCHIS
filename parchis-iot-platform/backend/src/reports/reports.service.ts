import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReports() {
    const [games, correctAnswers, incorrectAnswers, movements, questions] = await Promise.all([
      this.prisma.gameSession.findMany({ include: { players: true } }),
      this.prisma.answerHistory.count({ where: { isCorrect: true } }),
      this.prisma.answerHistory.count({ where: { isCorrect: false } }),
      this.prisma.moveHistory.findMany(),
      this.prisma.question.findMany({ include: { answers: true } }),
    ]);

    const finished = games.filter((game) => game.status === 'FINISHED');
    const averageDuration = finished.length
      ? Math.round(finished.reduce((sum, game) => sum + game.durationSeconds, 0) / finished.length)
      : 0;

    const topPlayer = games
      .flatMap((game) => game.players)
      .sort((a, b) => b.educationalScore - a.educationalScore)[0];

    const errorsByTile = Object.values(
      movements
        .filter((movement) => movement.isCorrect === false)
        .reduce<Record<string, { tile: number; errors: number }>>((acc, movement) => {
          const tile = movement.toTile ?? -1;
          acc[tile] = acc[tile] || { tile, errors: 0 };
          acc[tile].errors += 1;
          return acc;
        }, {}),
    ).sort((a, b) => b.errors - a.errors);

    const lowestAccuracyQuestions = questions
      .map((question) => {
        const total = question.answers.length;
        const correct = question.answers.filter((answer) => answer.isCorrect).length;
        return {
          id: question.id,
          title: question.title,
          accuracy: total ? Math.round((correct / total) * 100) : 0,
          total,
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);

    return {
      totals: {
        games: games.length,
        correctAnswers,
        incorrectAnswers,
        averageDuration,
        topEducationalPlayer: topPlayer?.name || null,
      },
      errorsByTile,
      lowestAccuracyQuestions,
      chartSeries: [
        { type: 'Correctas', value: correctAnswers },
        { type: 'Incorrectas', value: incorrectAnswers },
      ],
    };
  }
}
