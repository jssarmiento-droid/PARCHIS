import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DevicesService } from '../devices/devices.service';
import { GamesService } from '../games/games.service';

@WebSocketGateway({
  cors: {
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((url) => url.trim()),
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly devicesService: DevicesService,
    private readonly gamesService: GamesService,
  ) {}

  async handleConnection(client: Socket) {
    if (client.handshake.query.device === 'esp32') {
      await this.devicesService.markConnected('ESP32', {
        ipAddress: client.handshake.address,
        firmwareVersion: String(client.handshake.query.firmware || ''),
      });
      this.server.emit('device:status', await this.devicesService.getStatus());
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.handshake.query.device === 'esp32') {
      await this.devicesService.markDisconnected('ESP32');
      this.server.emit('device:status', await this.devicesService.getStatus());
    }
  }

  @SubscribeMessage('esp32:system-status')
  async onSystemStatus(@MessageBody() payload: Record<string, unknown>) {
    return this.ingestSystemStatus(payload);
  }

  async ingestSystemStatus(payload: Record<string, unknown>) {
    await this.devicesService.updateHealth('ESP32', payload);
    const status = await this.devicesService.getStatus();
    this.server.emit('device:status', status);
    this.server.emit('device:telemetry', payload);
    return { ok: true, devices: status };
  }

  @SubscribeMessage('nano:button-state')
  async onButtonState(@MessageBody() payload: { button: string; pressed: boolean; gameId?: string }) {
    return this.ingestButtonState(payload);
  }

  async ingestButtonState(payload: { button: string; pressed: boolean; gameId?: string }) {
    const event = await this.devicesService.recordButtonEvent(payload);
    this.server.emit('nano:button-state', event);
    return event;
  }

  @SubscribeMessage('esp32:game-event')
  async onGameEvent(@MessageBody() payload: Record<string, unknown>) {
    return this.ingestGameEvent(payload);
  }

  async ingestGameEvent(payload: Record<string, unknown>) {
    try {
      const result = await this.gamesService.processDeviceEvent(payload);
      this.server.emit('game:state', result.state);
      this.server.emit('game:movement', result.movement);
      if (result.finalReport) {
        this.server.emit('game:final-report', result.finalReport);
      }
      return result;
    } catch (error) {
      this.server.emit('system:error', {
        message: error instanceof Error ? error.message : 'No se pudo procesar el evento del ESP32',
        payload,
      });
      throw error;
    }
  }

  @SubscribeMessage('test:device-disconnect')
  async onTestDisconnect(@MessageBody() payload: { kind: 'ESP32' | 'ARDUINO_UNO' }) {
    await this.devicesService.markDisconnected(payload.kind);
    this.server.emit('device:status', await this.devicesService.getStatus());
  }

  @SubscribeMessage('web:start-game')
  async onStartGame(@MessageBody() payload: { gameId: string }, @ConnectedSocket() client: Socket) {
    const game = await this.gamesService.startGame(payload.gameId);
    client.broadcast.emit('esp32:start-game', { gameId: game.id, publicId: game.publicId });
    this.server.emit('game:state', game);
  }

  @SubscribeMessage('web:finish-game')
  async onFinishGame(@MessageBody() payload: { gameId: string }) {
    const report = await this.gamesService.finishGame(payload.gameId);
    this.server.emit('esp32:finish-game', payload);
    this.server.emit('game:state', await this.gamesService.findOne(payload.gameId));
    this.server.emit('game:final-report', report);
    return report;
  }

  @SubscribeMessage('web:sync-config')
  onSyncConfig(@MessageBody() payload: Record<string, unknown>) {
    this.server.emit('esp32:sync-config', payload);
  }
}
