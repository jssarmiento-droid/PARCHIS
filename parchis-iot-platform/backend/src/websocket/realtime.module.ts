import { Module } from '@nestjs/common';
import { DevicesModule } from '../devices/devices.module';
import { GamesModule } from '../games/games.module';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [DevicesModule, GamesModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
