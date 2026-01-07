import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { StoresModule } from './modules/stores/stores.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { AIModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PlayerModule } from './modules/player/player.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

// New Production-Ready Modules
import { MusicModule } from './modules/music/music.module';
import { StreamingModule } from './modules/streaming/streaming.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Event emitter for real-time events
    EventEmitterModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    OrganizationsModule,
    StoresModule,
    PlaylistsModule,
    AnnouncementsModule,
    SchedulerModule,
    AIModule,
    AnalyticsModule,
    PlayerModule,
    WebsocketModule,

    // Production Audio & Sync modules
    MusicModule,
    StreamingModule,
    CatalogModule,
    SyncModule,
  ],
})
export class AppModule {}
