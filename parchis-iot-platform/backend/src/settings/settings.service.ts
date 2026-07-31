import { Injectable } from '@nestjs/common';
import { Prisma, SystemConfig } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<SystemConfig> {
    const current = await this.prisma.systemConfig.findFirst();
    if (current) return current;
    return this.prisma.systemConfig.create({ data: {} });
  }

  async update(data: Prisma.SystemConfigUncheckedUpdateInput): Promise<SystemConfig> {
    const current = await this.get();
    return this.prisma.systemConfig.update({ where: { id: current.id }, data });
  }
}
