import { Module } from '@nestjs/common';
import { DevicesModule } from '../devices/devices.module';
import { RealtimeModule } from '../websocket/realtime.module';
import { SettingsModule } from '../settings/settings.module';
import { DeviceIngestionController } from './device-ingestion.controller';

@Module({
  imports: [RealtimeModule, DevicesModule, SettingsModule],
  controllers: [DeviceIngestionController],
})
export class DeviceIngestionModule {}
