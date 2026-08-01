import { Injectable } from '@nestjs/common';
import { DeviceKind, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    await this.ensureDefaults();
    const staleBefore = new Date(Date.now() - 30_000);
    await this.prisma.deviceStatus.updateMany({
      where: { connected: true, lastSeenAt: { lt: staleBefore } },
      data: { connected: false },
    });
    return this.prisma.deviceStatus.findMany({ orderBy: { kind: 'asc' } });
  }

  async markConnected(kind: DeviceKind, data: { ipAddress?: string; port?: number; firmwareVersion?: string }) {
    return this.prisma.deviceStatus.upsert({
      where: { kind },
      update: { connected: true, lastSeenAt: new Date(), ...data },
      create: { kind, name: kind === 'ESP32' ? 'ESP32 DevKit V1' : 'Arduino UNO R3 - Sensores Hall', connected: true, lastSeenAt: new Date(), ...data },
    });
  }

  async markDisconnected(kind: DeviceKind) {
    return this.prisma.deviceStatus.upsert({
      where: { kind },
      update: { connected: false },
      create: { kind, name: kind === 'ESP32' ? 'ESP32 DevKit V1' : 'Arduino UNO R3 - Sensores Hall', connected: false },
    });
  }

  async updateHealth(kind: DeviceKind, health: Record<string, unknown>) {
    const healthJson = health as Prisma.InputJsonObject;
    return this.prisma.deviceStatus.upsert({
      where: { kind },
      update: { connected: true, health: healthJson, lastSeenAt: new Date() },
      create: { kind, name: kind === 'ESP32' ? 'ESP32 DevKit V1' : 'Arduino UNO R3 - Sensores Hall', connected: true, health: healthJson, lastSeenAt: new Date() },
    });
  }

  async recordButtonEvent(payload: { button: string; pressed: boolean; gameId?: string }) {
    await this.updateHealth('ESP32', { lastButton: payload.button, pressed: payload.pressed });
    return this.prisma.buttonEvent.create({
      data: {
        gameId: payload.gameId,
        button: payload.button,
        pressed: payload.pressed,
        source: 'ESP32',
      },
    });
  }

  private async ensureDefaults() {
    await Promise.all([
      this.prisma.deviceStatus.upsert({
        where: { kind: 'ESP32' },
        update: {},
        create: { kind: 'ESP32', name: 'ESP32 DevKit V1' },
      }),
      this.prisma.deviceStatus.upsert({
        where: { kind: 'ARDUINO_UNO' },
        update: {},
        create: { kind: 'ARDUINO_UNO', name: 'Arduino UNO R3 - Sensores Hall' },
      }),
    ]);
  }
}
