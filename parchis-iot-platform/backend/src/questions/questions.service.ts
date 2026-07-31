import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { search?: string; topic?: string }) {
    const where: Prisma.QuestionWhereInput = {
      topic: filters.topic || undefined,
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

  create(data: Prisma.QuestionUncheckedCreateInput) {
    return this.prisma.question.create({ data });
  }

  update(id: string, data: Prisma.QuestionUncheckedUpdateInput) {
    return this.prisma.question.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.question.delete({ where: { id } });
    return { ok: true };
  }
}
