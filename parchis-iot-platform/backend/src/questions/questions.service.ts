import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, QuestionRegion } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { search?: string; topic?: string; region?: QuestionRegion }) {
    const where: Prisma.QuestionWhereInput = {
      topic: filters.topic || undefined,
      region: filters.region || undefined,
      OR: filters.search
        ? [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { text: { contains: filters.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    return this.prisma.question.findMany({
      where,
      include: { audio: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  private normalizeQuestionText(text: string) {
    return text
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  private async ensureUniqueQuestionText(text: string, currentId?: string) {
    const questions = await this.prisma.question.findMany({
      select: { id: true, text: true },
    });
    const normalizedText = this.normalizeQuestionText(text);
    const repeated = questions.find((question) =>
      question.id !== currentId && this.normalizeQuestionText(question.text) === normalizedText,
    );
    if (repeated) throw new BadRequestException('Ya existe una pregunta con ese enunciado');
  }

  async create(data: Prisma.QuestionUncheckedCreateInput) {
    if (typeof data.text === 'string') await this.ensureUniqueQuestionText(data.text);
    return this.prisma.question.create({ data });
  }

  async update(id: string, data: Prisma.QuestionUncheckedUpdateInput) {
    if (typeof data.text === 'string') await this.ensureUniqueQuestionText(data.text, id);
    return this.prisma.question.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.question.delete({ where: { id } });
    return { ok: true };
  }
}
