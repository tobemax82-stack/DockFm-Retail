import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AnnouncementsModule } from '../announcements/announcements.module';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    AnnouncementsModule,
  ],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
