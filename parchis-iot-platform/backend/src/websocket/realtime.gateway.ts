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
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true },
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
    await this.devicesService.updateHealth('ESP32', payload);
    this.server.emit('device:status', await this.devicesService.getStatus());
  }

  @SubscribeMessage('nano:button-state')
  async onButtonState(@MessageBody() payload: { button: string; pressed: boolean; gameId?: string }) {
    const event = await this.devicesService.recordButtonEvent(payload);
    this.server.emit('nano:button-state', event);
  }

  @SubscribeMessage('esp32:game-event')
  async onGameEvent(@MessageBody() payload: Record<string, any>) {
    try {
      const result = await this.gamesService.processDeviceEvent(payload);
      this.server.emit('game:state', result.state);
      this.server.emit('game:movement', result.movement);
      if (result.finalReport) {
        this.server.emit('game:final-report', result.finalReport);
      }
    } catch (error) {
      this.server.emit('system:error', {
        message: error instanceof Error ? error.message : 'No se pudo procesar el evento del ESP32',
        payload,
      });
    }
  }

  @SubscribeMessage('demo:device-disconnect')
  async onDemoDisconnect(@MessageBody() payload: { kind: 'ESP32' | 'ARDUINO_NANO' }) {
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
    this.server.emit('game:final-report', report);
  }

  @SubscribeMessage('web:sync-config')
  onSyncConfig(@MessageBody() payload: Record<string, unknown>) {
    this.server.emit('esp32:sync-config', payload);
  }
}
