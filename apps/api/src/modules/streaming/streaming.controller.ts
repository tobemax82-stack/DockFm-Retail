// =====================================================
// DOCKFM RETAIL - STREAMING CONTROLLER
// Real-time streaming control API
// =====================================================

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { 
  StreamingEngineService, 
  StreamSession,
  QueueItem,
  StreamConfig,
} from './streaming-engine.service';

@ApiTags('Streaming')
@Controller('streaming')
// @ApiBearerAuth()
export class StreamingController {
  constructor(private readonly streamingEngine: StreamingEngineService) {}

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  @Post('sessions')
  @ApiOperation({ summary: 'Create new streaming session' })
  @ApiResponse({ status: 201 })
  async createSession(
    @Body('storeId') storeId: string,
    @Body('config') config?: Partial<StreamConfig>,
  ): Promise<StreamSession> {
    return this.streamingEngine.createSession(storeId, config);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get streaming session' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async getSession(
    @Param('sessionId') sessionId: string,
  ): Promise<StreamSession | null> {
    return this.streamingEngine.getSession(sessionId);
  }

  @Get('stores/:storeId/session')
  @ApiOperation({ summary: 'Get streaming session by store' })
  @ApiParam({ name: 'storeId', type: 'string' })
  async getSessionByStore(
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ): Promise<StreamSession | null> {
    return this.streamingEngine.getSessionByStore(storeId);
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Destroy streaming session' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async destroySession(
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    return this.streamingEngine.destroySession(sessionId);
  }

  // =====================================================
  // PLAYBACK CONTROL
  // =====================================================

  @Post('sessions/:sessionId/play')
  @ApiOperation({ summary: 'Start playback' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async play(@Param('sessionId') sessionId: string): Promise<void> {
    return this.streamingEngine.play(sessionId);
  }

  @Post('sessions/:sessionId/pause')
  @ApiOperation({ summary: 'Pause playback' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async pause(@Param('sessionId') sessionId: string): Promise<void> {
    return this.streamingEngine.pause(sessionId);
  }

  @Post('sessions/:sessionId/stop')
  @ApiOperation({ summary: 'Stop playback' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async stop(@Param('sessionId') sessionId: string): Promise<void> {
    return this.streamingEngine.stop(sessionId);
  }

  @Post('sessions/:sessionId/seek')
  @ApiOperation({ summary: 'Seek to position' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async seek(
    @Param('sessionId') sessionId: string,
    @Body('position') position: number,
  ): Promise<void> {
    return this.streamingEngine.seek(sessionId, position);
  }

  @Put('sessions/:sessionId/volume')
  @ApiOperation({ summary: 'Set volume' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async setVolume(
    @Param('sessionId') sessionId: string,
    @Body('volume') volume: number,
  ): Promise<void> {
    return this.streamingEngine.setVolume(sessionId, volume);
  }

  @Put('sessions/:sessionId/mute')
  @ApiOperation({ summary: 'Set muted state' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async setMuted(
    @Param('sessionId') sessionId: string,
    @Body('muted') muted: boolean,
  ): Promise<void> {
    return this.streamingEngine.setMuted(sessionId, muted);
  }

  // =====================================================
  // QUEUE MANAGEMENT
  // =====================================================

  @Post('sessions/:sessionId/playlist')
  @ApiOperation({ summary: 'Load playlist into session' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async loadPlaylist(
    @Param('sessionId') sessionId: string,
    @Body('playlistId') playlistId: string,
    @Body('tracks') tracks: QueueItem[],
  ): Promise<void> {
    return this.streamingEngine.loadPlaylist(sessionId, playlistId, tracks);
  }

  @Post('sessions/:sessionId/next')
  @ApiOperation({ summary: 'Skip to next track' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async next(
    @Param('sessionId') sessionId: string,
  ): Promise<QueueItem | null> {
    return this.streamingEngine.next(sessionId);
  }

  @Post('sessions/:sessionId/previous')
  @ApiOperation({ summary: 'Go to previous track' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async previous(
    @Param('sessionId') sessionId: string,
  ): Promise<QueueItem | null> {
    return this.streamingEngine.previous(sessionId);
  }

  @Post('sessions/:sessionId/skip-to/:index')
  @ApiOperation({ summary: 'Skip to specific track' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  @ApiParam({ name: 'index', type: 'number' })
  async skipTo(
    @Param('sessionId') sessionId: string,
    @Param('index') index: number,
  ): Promise<QueueItem | null> {
    return this.streamingEngine.skipTo(sessionId, Number(index));
  }

  // =====================================================
  // ANNOUNCEMENTS
  // =====================================================

  @Post('sessions/:sessionId/announcement')
  @ApiOperation({ summary: 'Inject announcement into stream' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async injectAnnouncement(
    @Param('sessionId') sessionId: string,
    @Body() announcement: QueueItem,
  ): Promise<void> {
    return this.streamingEngine.injectAnnouncement(sessionId, announcement);
  }

  @Post('sessions/:sessionId/announcement/complete')
  @ApiOperation({ summary: 'Mark announcement as complete' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async announcementComplete(
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    return this.streamingEngine.announcementComplete(sessionId);
  }

  // =====================================================
  // AUDIO PROCESSING
  // =====================================================

  @Post('audio/crossfade')
  @ApiOperation({ summary: 'Calculate crossfade parameters' })
  async calculateCrossfade(
    @Body('currentDuration') currentDuration: number,
    @Body('nextDuration') nextDuration: number,
    @Body('config') config: Partial<StreamConfig>,
  ) {
    const fullConfig = {
      crossfadeDuration: 3000,
      crossfadeCurve: 'equal-power' as const,
      ...config,
    } as StreamConfig;

    return this.streamingEngine.calculateCrossfade(
      { duration: currentDuration },
      { duration: nextDuration },
      fullConfig,
    );
  }

  @Get('audio/loudness-spec')
  @ApiOperation({ summary: 'Get EBU R128 loudness specification' })
  async getLoudnessSpec() {
    return this.streamingEngine.getLoudnessSpec();
  }

  @Post('audio/normalization-gain')
  @ApiOperation({ summary: 'Calculate normalization gain' })
  async calculateNormalizationGain(
    @Body('measuredLufs') measuredLufs: number,
    @Body('targetLufs') targetLufs?: number,
  ) {
    return {
      gainDb: this.streamingEngine.calculateNormalizationGain(
        measuredLufs,
        targetLufs,
      ),
    };
  }

  // =====================================================
  // STATUS
  // =====================================================

  @Get('sessions/:sessionId/status')
  @ApiOperation({ summary: 'Get session status' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async getStatus(@Param('sessionId') sessionId: string) {
    return this.streamingEngine.getStatus(sessionId);
  }

  @Get('sessions/:sessionId/buffer')
  @ApiOperation({ summary: 'Get next segments for buffering' })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async getNextSegments(
    @Param('sessionId') sessionId: string,
    @Query('count') count?: number,
  ): Promise<QueueItem[]> {
    return this.streamingEngine.getNextSegments(
      sessionId,
      count ? Number(count) : 3,
    );
  }

  @Get('status')
  @ApiOperation({ summary: 'Get streaming engine status' })
  async getEngineStatus() {
    return {
      activeSessions: this.streamingEngine.getActiveSessionCount(),
      sessions: this.streamingEngine.getActiveSessions().map((s) => ({
        sessionId: s.sessionId,
        storeId: s.storeId,
        isPlaying: s.isPlaying,
        currentTrackId: s.currentTrackId,
        queueLength: s.queue.length,
      })),
    };
  }
}
