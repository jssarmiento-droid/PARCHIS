import { BadRequestException, Body, Controller, Get, Headers, Param, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../common/prisma.service';
import { DevicesService } from '../devices/devices.service';
import { SettingsService } from '../settings/settings.service';
import { RealtimeGateway } from '../websocket/realtime.gateway';

@Controller('device')
export class DeviceIngestionController {
  constructor(
    private readonly gateway: RealtimeGateway,
    private readonly prisma: PrismaService,
    private readonly devices: DevicesService,
    private readonly settings: SettingsService,
    private readonly config: ConfigService,
  ) {}

  @Post('events')
  async event(@Body() payload: Record<string, unknown>, @Headers('x-device-token') token?: string) {
    this.validateToken(token);
    if (!payload.eventName) throw new BadRequestException('El evento del dispositivo es obligatorio');
    const result = await this.gateway.ingestGameEvent(payload);
    return { ok: true, ...result };
  }

  @Post('status')
  async status(
    @Body() payload: Record<string, unknown>,
    @Headers('x-device-token') token?: string,
    @Req() request?: Request,
  ) {
    this.validateToken(token);
    const ipAddress = (request?.ip || request?.socket.remoteAddress || '').replace(/^::ffff:/, '') || undefined;
    await this.devices.markConnected('ESP32', {
      ipAddress,
      firmwareVersion: typeof payload.firmwareVersion === 'string' ? payload.firmwareVersion : undefined,
    });
    if (payload.sensorBridge === 'connected') {
      await this.devices.updateHealth('ESP32_SENSORS', {
        bridge: 'ESP32-I2C',
        connected: true,
      });
    }
    return this.gateway.ingestSystemStatus(payload);
  }

  @Post('buttons')
  async button(@Body() payload: { button?: string; pressed?: boolean; gameId?: string }, @Headers('x-device-token') token?: string) {
    this.validateToken(token);
    if (!payload.button || typeof payload.pressed !== 'boolean') {
      throw new BadRequestException('El botón y su estado son obligatorios');
    }
    return { ok: true, event: await this.gateway.ingestButtonState(payload as { button: string; pressed: boolean; gameId?: string }) };
  }

  @Get('games/active')
  async activeGame(@Headers('x-device-token') token?: string) {
    this.validateToken(token);
    const game = await this.prisma.gameSession.findFirst({
      where: { status: { in: ['CREATED', 'RUNNING', 'PAUSED'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        players: true,
        selectedQuestions: {
          include: { question: { include: { audio: true } } },
          orderBy: { order: 'asc' },
        },
      },
    });
    return game || null;
  }

  @Get('games/:id/questions')
  async questions(@Param('id') id: string, @Headers('x-device-token') token?: string) {
    this.validateToken(token);
    const selections = await this.prisma.gameQuestion.findMany({
      where: { gameId: id },
      include: { question: { include: { audio: true } } },
      orderBy: { order: 'asc' },
    });
    return selections;
  }

  @Get('config')
  async deviceConfig(@Headers('x-device-token') token?: string) {
    this.validateToken(token);
    const settings = await this.settings.get();
    return {
      playerCount: settings.playerCount,
      timeoutSeconds: settings.timeoutSeconds,
      volume: settings.volume,
    };
  }

  private validateToken(token?: string) {
    const expected = this.config.get<string>('DEVICE_TOKEN');
    if (expected && token !== expected) throw new UnauthorizedException('Token del dispositivo inválido');
  }
}
