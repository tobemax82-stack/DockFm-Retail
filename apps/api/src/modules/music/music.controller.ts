// =====================================================
// DOCKFM RETAIL - MUSIC CONTROLLER
// REST API for Music Catalog & Streaming
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
  Headers,
  Res,
  UseGuards,
  HttpStatus,
  StreamableFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MusicService } from './music.service';
import {
  CreateTrackDto,
  UpdateTrackDto,
  SearchTracksDto,
  StreamingConfigDto,
  TrackResponseDto,
  PaginatedTracksResponseDto,
  StreamTokenResponseDto,
  MoodType,
} from './dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Music')
@Controller('music')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  // =====================================================
  // TRACK MANAGEMENT
  // =====================================================

  @Post('tracks')
  @ApiOperation({ summary: 'Create a new track' })
  @ApiResponse({ status: 201, type: TrackResponseDto })
  async createTrack(
    @Body() dto: CreateTrackDto,
    // @CurrentUser() user: any,
  ): Promise<TrackResponseDto> {
    // const organizationId = user.organizationId;
    const organizationId = null; // Global for now
    return this.musicService.createTrack(organizationId, dto);
  }

  @Get('tracks/:id')
  @ApiOperation({ summary: 'Get track by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: TrackResponseDto })
  async getTrack(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TrackResponseDto> {
    return this.musicService.getTrack(id);
  }

  @Put('tracks/:id')
  @ApiOperation({ summary: 'Update track' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: TrackResponseDto })
  async updateTrack(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrackDto,
  ): Promise<TrackResponseDto> {
    return this.musicService.updateTrack(id, dto);
  }

  @Delete('tracks/:id')
  @ApiOperation({ summary: 'Delete track' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204 })
  async deleteTrack(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.musicService.deleteTrack(id);
  }

  @Get('tracks')
  @ApiOperation({ summary: 'Search tracks' })
  @ApiResponse({ status: 200, type: PaginatedTracksResponseDto })
  async searchTracks(
    @Query() dto: SearchTracksDto,
    // @CurrentUser() user: any,
  ): Promise<PaginatedTracksResponseDto> {
    // const organizationId = user.organizationId;
    const organizationId = null;
    return this.musicService.searchTracks(organizationId, dto);
  }

  // =====================================================
  // ROYALTY-FREE LIBRARY
  // =====================================================

  @Get('library')
  @ApiOperation({ summary: 'Get royalty-free music library' })
  @ApiQuery({ name: 'mood', enum: MoodType, required: false })
  @ApiQuery({ name: 'genre', type: 'string', required: false })
  @ApiQuery({ name: 'minBpm', type: 'number', required: false })
  @ApiQuery({ name: 'maxBpm', type: 'number', required: false })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({ status: 200, type: PaginatedTracksResponseDto })
  async getLibrary(
    @Query('mood') mood?: MoodType,
    @Query('genre') genre?: string,
    @Query('minBpm') minBpm?: number,
    @Query('maxBpm') maxBpm?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedTracksResponseDto> {
    return this.musicService.getRoyaltyFreeLibrary({
      mood,
      genre,
      minBpm: minBpm ? Number(minBpm) : undefined,
      maxBpm: maxBpm ? Number(maxBpm) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
  }

  @Get('library/mood/:mood')
  @ApiOperation({ summary: 'Get tracks by mood' })
  @ApiParam({ name: 'mood', enum: MoodType })
  @ApiResponse({ status: 200, type: [TrackResponseDto] })
  async getTracksByMood(
    @Param('mood') mood: MoodType,
    @Query('count') count?: number,
    // @CurrentUser() user: any,
  ): Promise<TrackResponseDto[]> {
    // const organizationId = user.organizationId;
    const organizationId = null;
    return this.musicService.getTracksForMood(
      mood,
      organizationId,
      count ? Number(count) : 50,
    );
  }

  @Get('tracks/:id/recommendations')
  @ApiOperation({ summary: 'Get recommended tracks based on current track' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: [TrackResponseDto] })
  async getRecommendations(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('count') count?: number,
  ): Promise<TrackResponseDto[]> {
    return this.musicService.getRecommendedTracks(id, count ? Number(count) : 5);
  }

  // =====================================================
  // STREAMING
  // =====================================================

  @Post('stream/token')
  @ApiOperation({ summary: 'Generate streaming token for track' })
  @ApiResponse({ status: 201, type: StreamTokenResponseDto })
  async generateStreamToken(
    @Body('trackId') trackId: string,
    @Body('storeId') storeId: string,
    @Body('config') config?: StreamingConfigDto,
  ): Promise<StreamTokenResponseDto> {
    return this.musicService.generateStreamToken(trackId, storeId, config);
  }

  @Get('stream/:trackId')
  @ApiOperation({ summary: 'Stream audio track' })
  @ApiParam({ name: 'trackId', type: 'string' })
  @ApiQuery({ name: 'token', type: 'string', required: true })
  @ApiResponse({ status: 200, description: 'Audio stream' })
  async streamTrack(
    @Param('trackId', ParseUUIDPipe) trackId: string,
    @Query('token') token: string,
    @Headers('range') range: string,
    @Res() res: Response,
  ): Promise<void> {
    // Validate token
    const tokenData = await this.musicService.validateStreamToken(token);
    
    if (tokenData.trackId !== trackId) {
      res.status(HttpStatus.FORBIDDEN).send('Invalid token for track');
      return;
    }

    // Get stream info
    const streamInfo = await this.musicService.getStreamInfo(trackId);

    // For now, redirect to actual file URL
    // In production, this would serve the file directly or proxy it
    res.redirect(streamInfo.url);
  }

  @Get('stream/:trackId/info')
  @ApiOperation({ summary: 'Get streaming info for track' })
  @ApiParam({ name: 'trackId', type: 'string' })
  async getStreamInfo(
    @Param('trackId', ParseUUIDPipe) trackId: string,
  ) {
    return this.musicService.getStreamInfo(trackId);
  }

  // =====================================================
  // PLAYLIST QUEUE
  // =====================================================

  @Get('playlists/:playlistId/queue')
  @ApiOperation({ summary: 'Get playlist queue' })
  @ApiParam({ name: 'playlistId', type: 'string' })
  @ApiQuery({ name: 'start', type: 'number', required: false })
  @ApiQuery({ name: 'count', type: 'number', required: false })
  @ApiResponse({ status: 200, type: [TrackResponseDto] })
  async getPlaylistQueue(
    @Param('playlistId', ParseUUIDPipe) playlistId: string,
    @Query('start') start?: number,
    @Query('count') count?: number,
  ): Promise<TrackResponseDto[]> {
    return this.musicService.getPlaylistQueue(
      playlistId,
      start ? Number(start) : 0,
      count ? Number(count) : 10,
    );
  }

  @Post('playlists/:playlistId/tracks')
  @ApiOperation({ summary: 'Add track to playlist' })
  @ApiParam({ name: 'playlistId', type: 'string' })
  @ApiResponse({ status: 201 })
  async addToPlaylist(
    @Param('playlistId', ParseUUIDPipe) playlistId: string,
    @Body('trackId') trackId: string,
  ): Promise<void> {
    return this.musicService.addToPlaylist(playlistId, trackId);
  }

  @Delete('playlists/:playlistId/tracks/:trackId')
  @ApiOperation({ summary: 'Remove track from playlist' })
  @ApiParam({ name: 'playlistId', type: 'string' })
  @ApiParam({ name: 'trackId', type: 'string' })
  @ApiResponse({ status: 204 })
  async removeFromPlaylist(
    @Param('playlistId', ParseUUIDPipe) playlistId: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
  ): Promise<void> {
    return this.musicService.removeFromPlaylist(playlistId, trackId);
  }

  @Put('playlists/:playlistId/reorder')
  @ApiOperation({ summary: 'Reorder playlist tracks' })
  @ApiParam({ name: 'playlistId', type: 'string' })
  @ApiResponse({ status: 200 })
  async reorderPlaylist(
    @Param('playlistId', ParseUUIDPipe) playlistId: string,
    @Body('trackIds') trackIds: string[],
  ): Promise<void> {
    return this.musicService.reorderPlaylist(playlistId, trackIds);
  }

  // =====================================================
  // AUDIO PROCESSING CONFIG
  // =====================================================

  @Get('config/streaming')
  @ApiOperation({ summary: 'Get default streaming configuration' })
  async getDefaultConfig() {
    return this.musicService.getDefaultStreamingConfig();
  }

  @Put('stores/:storeId/config/streaming')
  @ApiOperation({ summary: 'Update store streaming configuration' })
  @ApiParam({ name: 'storeId', type: 'string' })
  async updateStoreConfig(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Body() config: StreamingConfigDto,
  ) {
    return this.musicService.updateStoreStreamingConfig(storeId, config);
  }

  // =====================================================
  // CROSSFADE & DUCKING INFO
  // =====================================================

  @Post('audio/crossfade-points')
  @ApiOperation({ summary: 'Calculate crossfade timing points' })
  async getCrossfadePoints(
    @Body('currentDuration') currentDuration: number,
    @Body('nextDuration') nextDuration: number,
    @Body('crossfadeDuration') crossfadeDuration?: number,
  ) {
    return this.musicService.calculateCrossfadePoints(
      { duration: currentDuration },
      { duration: nextDuration },
      crossfadeDuration,
    );
  }

  @Get('audio/ducking-config')
  @ApiOperation({ summary: 'Get ducking configuration for announcements' })
  @ApiQuery({ name: 'priority', type: 'number', required: false })
  async getDuckingConfig(@Query('priority') priority?: number) {
    return this.musicService.getDuckingConfig(priority ? Number(priority) : 5);
  }
}
