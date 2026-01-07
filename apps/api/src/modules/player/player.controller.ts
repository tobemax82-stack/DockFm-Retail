import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { PlayerHeartbeatDto, TrackEventDto, AnnouncementEventDto, SyncStateDto } from './dto/player.dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Controller per il Player Electron
 * Questi endpoint usano autenticazione via Device ID invece che JWT
 */
@ApiTags('Player')
@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get(':storeId/state')
  @Public()
  @ApiOperation({ summary: 'Ottieni stato completo del player' })
  @ApiHeader({ name: 'x-device-id', description: 'ID dispositivo' })
  @ApiResponse({ status: 200, description: 'Stato del player' })
  @ApiResponse({ status: 401, description: 'Dispositivo non autorizzato' })
  async getState(
    @Param('storeId') storeId: string,
    @Headers('x-device-id') deviceId: string,
  ) {
    if (!deviceId) {
      throw new UnauthorizedException('Device ID richiesto');
    }
    return this.playerService.getPlayerState(storeId, deviceId);
  }

  @Post('heartbeat')
  @Public()
  @ApiOperation({ summary: 'Heartbeat dal player (mantiene online)' })
  @ApiResponse({ status: 200, description: 'Heartbeat ricevuto' })
  heartbeat(@Body() dto: PlayerHeartbeatDto) {
    return this.playerService.heartbeat(dto);
  }

  @Post(':storeId/offline')
  @Public()
  @ApiOperation({ summary: 'Segnala player offline' })
  @ApiHeader({ name: 'x-device-id', description: 'ID dispositivo' })
  @ApiResponse({ status: 200, description: 'Stato aggiornato' })
  goOffline(
    @Param('storeId') storeId: string,
    @Headers('x-device-id') deviceId: string,
  ) {
    if (!deviceId) {
      throw new UnauthorizedException('Device ID richiesto');
    }
    return this.playerService.goOffline(storeId, deviceId);
  }

  @Post(':storeId/track/start')
  @Public()
  @ApiOperation({ summary: 'Segnala inizio riproduzione traccia' })
  @ApiResponse({ status: 201, description: 'Evento registrato' })
  trackStarted(
    @Param('storeId') storeId: string,
    @Body() dto: TrackEventDto,
  ) {
    return this.playerService.trackStarted(storeId, dto.trackId);
  }

  @Post(':storeId/track/end')
  @Public()
  @ApiOperation({ summary: 'Segnala fine riproduzione traccia' })
  @ApiResponse({ status: 201, description: 'Evento registrato' })
  trackEnded(
    @Param('storeId') storeId: string,
    @Body() dto: TrackEventDto,
  ) {
    return this.playerService.trackEnded(storeId, dto.trackId);
  }

  @Post(':storeId/announcement/played')
  @Public()
  @ApiOperation({ summary: 'Segnala riproduzione annuncio' })
  @ApiResponse({ status: 201, description: 'Evento registrato' })
  announcementPlayed(
    @Param('storeId') storeId: string,
    @Body() dto: AnnouncementEventDto,
  ) {
    return this.playerService.announcementPlayed(storeId, dto.announcementId);
  }

  @Get(':storeId/offline-content')
  @Public()
  @ApiOperation({ summary: 'Scarica contenuti per modalità offline' })
  @ApiHeader({ name: 'x-device-id', description: 'ID dispositivo' })
  @ApiResponse({ status: 200, description: 'Contenuti per offline' })
  getOfflineContent(
    @Param('storeId') storeId: string,
    @Headers('x-device-id') deviceId: string,
  ) {
    if (!deviceId) {
      throw new UnauthorizedException('Device ID richiesto');
    }
    return this.playerService.getOfflineContent(storeId, deviceId);
  }

  @Post(':storeId/sync')
  @Public()
  @ApiOperation({ summary: 'Sincronizza stato del player' })
  @ApiHeader({ name: 'x-device-id', description: 'ID dispositivo' })
  @ApiResponse({ status: 200, description: 'Stato sincronizzato' })
  syncState(
    @Param('storeId') storeId: string,
    @Headers('x-device-id') deviceId: string,
    @Body() dto: SyncStateDto,
  ) {
    if (!deviceId) {
      throw new UnauthorizedException('Device ID richiesto');
    }
    return this.playerService.syncState(storeId, deviceId, dto.state);
  }
}
