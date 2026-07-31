import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AudiosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.audioAsset.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const audio = await this.prisma.audioAsset.findUnique({ where: { id } });
    if (!audio) throw new NotFoundException('Audio no encontrado');
    return audio;
  }

  createFromUpload(file: Express.Multer.File, dto: { name: string; relationType?: 'QUESTION' | 'INFORMATIVE_TILE' | 'GENERAL' }) {
    if (!file) throw new BadRequestException('Debe subir un archivo MP3');
    return this.prisma.audioAsset.create({
      data: {
        name: dto.name || file.originalname,
        filename: file.filename,
        path: file.path,
        mimeType: file.mimetype,
        relationType: dto.relationType || 'GENERAL',
      },
    });
  }

  update(id: string, dto: { name?: string; relationType?: 'QUESTION' | 'INFORMATIVE_TILE' | 'GENERAL' }) {
    return this.prisma.audioAsset.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.audioAsset.delete({ where: { id } });
    return { ok: true };
  }
}
