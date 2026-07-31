import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DevicesModule } from './devices/devices.module';
import { GamesModule } from './games/games.module';
import { QuestionsModule } from './questions/questions.module';
import { AudiosModule } from './audios/audios.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { RealtimeModule } from './websocket/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    DevicesModule,
    GamesModule,
    QuestionsModule,
    AudiosModule,
    ReportsModule,
    SettingsModule,
    RealtimeModule,
  ],
})
export class AppModule {}
