// =====================================================
// DOCKFM RETAIL - STREAMING MODULE
// Real-time Audio Streaming Engine
// =====================================================

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StreamingController } from './streaming.controller';
import { StreamingEngineService } from './streaming-engine.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [StreamingController],
  providers: [StreamingEngineService],
  exports: [StreamingEngineService],
})
export class StreamingModule {}
