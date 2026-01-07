import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { StoresModule } from '../stores/stores.module';
import { PlaylistsModule } from '../playlists/playlists.module';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    PrismaModule,
    StoresModule,
    PlaylistsModule,
    AnnouncementsModule,
    SchedulerModule,
    AnalyticsModule,
  ],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
