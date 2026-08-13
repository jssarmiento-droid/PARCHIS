import { Injectable } from '@nestjs/common';
import { DeviceKind, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  private deviceName(kind: DeviceKind) {
    if (kind === 'ESP32') return 'ESP32 principal - Juego y audio';
    if (kind === 'ESP32_SENSORS') return 'ESP32 sensores - Casillas 1 a 15';
    return 'Dispositivo heredado - Sensores Hall';
  }

  async getStatus() {
    await this.ensureDefaults();
    const staleBefore = new Date(Date.now() - 30_000);
    await this.prisma.deviceStatus.updateMany({
      where: { connected: true, lastSeenAt: { lt: staleBefore } },
      data: { connected: false },
    });
    return this.prisma.deviceStatus.findMany({
      where: { kind: { not: 'ARDUINO_UNO' } },
      orderBy: { kind: 'asc' },
    });
  }

  async markConnected(kind: DeviceKind, data: { ipAddress?: string; port?: number; firmwareVersion?: string }) {
    return this.prisma.deviceStatus.upsert({
      where: { kind },
      update: { connected: true, lastSeenAt: new Date(), ...data },
      create: { kind, name: this.deviceName(kind), connected: true, lastSeenAt: new Date(), ...data },
    });
  }

  async markDisconnected(kind: DeviceKind) {
    return this.prisma.deviceStatus.upsert({
      where: { kind },
      update: { connected: false },
      create: { kind, name: this.deviceName(kind), connected: false },
    });
  }

  async updateHealth(kind: DeviceKind, health: Record<string, unknown>) {
    const healthJson = health as Prisma.InputJsonObject;
    return this.prisma.deviceStatus.upsert({
      where: { kind },
      update: { connected: true, health: healthJson, lastSeenAt: new Date() },
      create: { kind, name: this.deviceName(kind), connected: true, health: healthJson, lastSeenAt: new Date() },
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
        update: { name: this.deviceName('ESP32') },
        create: { kind: 'ESP32', name: this.deviceName('ESP32') },
      }),
      this.prisma.deviceStatus.upsert({
        where: { kind: 'ESP32_SENSORS' },
        update: { name: this.deviceName('ESP32_SENSORS') },
        create: { kind: 'ESP32_SENSORS', name: this.deviceName('ESP32_SENSORS') },
      }),
    ]);
  }
}
