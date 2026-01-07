import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { 
  GenerateAnnouncementDto, 
  GenerateJingleDto, 
  GenerateMusicDto,
  TextToSpeechDto,
} from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('AI - Generazione Contenuti')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Get('voices')
  @ApiOperation({ summary: 'Lista voci disponibili per TTS' })
  @ApiResponse({ status: 200, description: 'Lista voci' })
  getVoices() {
    return this.aiService.getAvailableVoices();
  }

  @Post('announcement')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Genera annuncio vocale con AI' })
  @ApiResponse({ status: 201, description: 'Annuncio in generazione' })
  generateAnnouncement(
    @Body() dto: GenerateAnnouncementDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.aiService.generateAnnouncement(dto, orgId);
  }

  @Post('jingle')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Genera jingle musicale con AI' })
  @ApiResponse({ status: 201, description: 'Jingle in generazione' })
  generateJingle(
    @Body() dto: GenerateJingleDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.aiService.generateJingle(dto, orgId);
  }

  @Post('music')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Genera musica royalty-free con AI' })
  @ApiResponse({ status: 201, description: 'Musica in generazione' })
  generateMusic(
    @Body() dto: GenerateMusicDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.aiService.generateMusic(dto, orgId);
  }

  @Post('tts')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Text-to-Speech diretto (ritorna audio)' })
  @ApiResponse({ status: 200, description: 'Audio MP3' })
  async textToSpeech(
    @Body() dto: TextToSpeechDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const audioBuffer = await this.aiService.textToSpeech(dto);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="tts.mp3"',
    });

    return new StreamableFile(audioBuffer);
  }

  @Get('generation/:id')
  @ApiOperation({ summary: 'Stato generazione' })
  @ApiResponse({ status: 200, description: 'Stato della generazione' })
  getGenerationStatus(@Param('id') id: string) {
    return this.aiService.getGenerationStatus(id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Storico generazioni' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista generazioni' })
  getHistory(
    @CurrentUser('organizationId') orgId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.aiService.getGenerationHistory(orgId, page, limit);
  }
}
