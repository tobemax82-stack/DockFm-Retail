// =====================================================
// DOCKFM RETAIL - MUSIC SERVICE
// Music Catalog & Streaming Management
// =====================================================

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import {
  CreateTrackDto,
  UpdateTrackDto,
  SearchTracksDto,
  StreamingConfigDto,
  TrackResponseDto,
  PaginatedTracksResponseDto,
  StreamTokenResponseDto,
  MoodType,
  TrackSource,
} from './dto';

// =====================================================
// INTERFACES
// =====================================================

interface AudioProcessingConfig {
  targetLufs: number;      // EBU R128 loudness target (-14 LUFS recommended)
  crossfadeDuration: number; // ms
  format: 'mp3' | 'aac' | 'opus';
  bitrate: number;
  sampleRate: number;
}

interface TrackMetadata {
  genres?: string[];
  energy?: number;
  source?: TrackSource;
  externalId?: string;
  license?: string;
  waveform?: number[];
  coverUrl?: string;
}

// =====================================================
// SERVICE
// =====================================================

@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name);
  private readonly streamSecret: string;
  private readonly defaultConfig: AudioProcessingConfig = {
    targetLufs: -14,        // EBU R128 standard
    crossfadeDuration: 3000,
    format: 'aac',
    bitrate: 128,
    sampleRate: 44100,
  };

  constructor(private prisma: PrismaService) {
    this.streamSecret = process.env.STREAM_SECRET || crypto.randomBytes(32).toString('hex');
  }

  // =====================================================
  // TRACK CRUD OPERATIONS
  // =====================================================

  async createTrack(
    organizationId: string | null,
    dto: CreateTrackDto,
  ): Promise<TrackResponseDto> {
    this.logger.log(`Creating track: ${dto.title}`);

    const metadata: TrackMetadata = {
      genres: dto.genres,
      energy: dto.energy,
      source: dto.source || TrackSource.UPLOAD,
      externalId: dto.externalId,
      license: dto.license,
      waveform: dto.waveform ? JSON.parse(dto.waveform) : undefined,
      coverUrl: dto.coverUrl,
    };

    const track = await this.prisma.track.create({
      data: {
        title: dto.title,
        artist: dto.artist,
        album: dto.album,
        duration: dto.duration,
        url: dto.url,
        mood: dto.mood as any,
        bpm: dto.bpm,
        isAI: dto.isAI || false,
        organizationId,
      },
    });

    return this.toTrackResponse(track, metadata);
  }

  async getTrack(trackId: string): Promise<TrackResponseDto> {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      throw new NotFoundException(`Track ${trackId} not found`);
    }

    return this.toTrackResponse(track);
  }

  async updateTrack(
    trackId: string,
    dto: UpdateTrackDto,
  ): Promise<TrackResponseDto> {
    const track = await this.prisma.track.update({
      where: { id: trackId },
      data: {
        title: dto.title,
        artist: dto.artist,
        album: dto.album,
        mood: dto.mood as any,
        bpm: dto.bpm,
      },
    });

    return this.toTrackResponse(track);
  }

  async deleteTrack(trackId: string): Promise<void> {
    await this.prisma.track.delete({
      where: { id: trackId },
    });
  }

  async searchTracks(
    organizationId: string | null,
    dto: SearchTracksDto,
  ): Promise<PaginatedTracksResponseDto> {
    const { page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { organizationId: null },  // Global tracks
        { organizationId },        // Organization tracks
      ],
    };

    if (dto.query) {
      where.AND = [
        {
          OR: [
            { title: { contains: dto.query, mode: 'insensitive' } },
            { artist: { contains: dto.query, mode: 'insensitive' } },
            { album: { contains: dto.query, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (dto.mood) {
      where.mood = dto.mood;
    }

    if (dto.minBpm || dto.maxBpm) {
      where.bpm = {};
      if (dto.minBpm) where.bpm.gte = dto.minBpm;
      if (dto.maxBpm) where.bpm.lte = dto.maxBpm;
    }

    if (dto.minDuration || dto.maxDuration) {
      where.duration = {};
      if (dto.minDuration) where.duration.gte = dto.minDuration;
      if (dto.maxDuration) where.duration.lte = dto.maxDuration;
    }

    const [tracks, total] = await Promise.all([
      this.prisma.track.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.track.count({ where }),
    ]);

    return {
      items: tracks.map((t) => this.toTrackResponse(t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // =====================================================
  // ROYALTY-FREE LIBRARY
  // =====================================================

  async getRoyaltyFreeLibrary(
    filters: {
      mood?: MoodType;
      genre?: string;
      minBpm?: number;
      maxBpm?: number;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<PaginatedTracksResponseDto> {
    const { page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: null, // Global tracks only
      isAnnouncement: false,
    };

    if (filters.mood) {
      where.mood = filters.mood;
    }

    if (filters.minBpm || filters.maxBpm) {
      where.bpm = {};
      if (filters.minBpm) where.bpm.gte = filters.minBpm;
      if (filters.maxBpm) where.bpm.lte = filters.maxBpm;
    }

    const [tracks, total] = await Promise.all([
      this.prisma.track.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ mood: 'asc' }, { title: 'asc' }],
      }),
      this.prisma.track.count({ where }),
    ]);

    return {
      items: tracks.map((t) => this.toTrackResponse(t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async importFromExternalSource(
    source: TrackSource,
    externalId: string,
    metadata: any,
  ): Promise<TrackResponseDto> {
    this.logger.log(`Importing track from ${source}: ${externalId}`);

    // Check if already imported
    const existing = await this.prisma.track.findFirst({
      where: {
        organizationId: null,
        // Would need to store externalId in metadata JSON
      },
    });

    if (existing) {
      return this.toTrackResponse(existing);
    }

    // Create track from external source
    const track = await this.prisma.track.create({
      data: {
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        duration: metadata.duration,
        url: metadata.url,
        mood: this.inferMood(metadata),
        bpm: metadata.bpm,
        isAI: false,
        organizationId: null, // Global
      },
    });

    return this.toTrackResponse(track);
  }

  // =====================================================
  // STREAMING ENGINE
  // =====================================================

  async generateStreamToken(
    trackId: string,
    storeId: string,
    config: StreamingConfigDto = {},
  ): Promise<StreamTokenResponseDto> {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      throw new NotFoundException(`Track ${trackId} not found`);
    }

    // Generate JWT token for streaming
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
    const token = jwt.sign(
      {
        trackId,
        storeId,
        config: {
          ...this.defaultConfig,
          ...config,
        },
      },
      this.streamSecret,
      { expiresIn: '4h' },
    );

    const streamUrl = `/api/v1/music/stream/${trackId}?token=${token}`;

    return {
      token,
      streamUrl,
      expiresAt,
    };
  }

  async validateStreamToken(token: string): Promise<{
    trackId: string;
    storeId: string;
    config: AudioProcessingConfig;
  }> {
    try {
      const payload = jwt.verify(token, this.streamSecret) as any;
      return {
        trackId: payload.trackId,
        storeId: payload.storeId,
        config: payload.config,
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired stream token');
    }
  }

  async getStreamInfo(trackId: string): Promise<{
    url: string;
    duration: number;
    format: string;
    bitrate: number;
    loudness: number;
  }> {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      throw new NotFoundException(`Track ${trackId} not found`);
    }

    return {
      url: track.url,
      duration: track.duration,
      format: 'aac',
      bitrate: 128,
      loudness: -14, // Target LUFS
    };
  }

  // =====================================================
  // AUDIO PROCESSING CONFIG
  // =====================================================

  getDefaultStreamingConfig(): AudioProcessingConfig {
    return { ...this.defaultConfig };
  }

  async updateStoreStreamingConfig(
    storeId: string,
    config: Partial<AudioProcessingConfig>,
  ): Promise<AudioProcessingConfig> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store ${storeId} not found`);
    }

    const settings = (store.settings as any) || {};
    const updatedConfig = {
      ...this.defaultConfig,
      ...settings.streamingConfig,
      ...config,
    };

    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        settings: {
          ...settings,
          streamingConfig: updatedConfig,
        },
      },
    });

    return updatedConfig;
  }

  // =====================================================
  // CROSSFADE & DUCKING
  // =====================================================

  calculateCrossfadePoints(
    currentTrack: { duration: number },
    nextTrack: { duration: number },
    crossfadeDuration: number = 3000,
  ): {
    fadeOutStart: number;
    fadeOutEnd: number;
    fadeInStart: number;
    fadeInEnd: number;
  } {
    const crossfadeSeconds = crossfadeDuration / 1000;
    
    return {
      fadeOutStart: currentTrack.duration - crossfadeSeconds,
      fadeOutEnd: currentTrack.duration,
      fadeInStart: 0,
      fadeInEnd: crossfadeSeconds,
    };
  }

  getDuckingConfig(announcementPriority: number = 5): {
    duckLevel: number;    // Volume reduction (0-1)
    fadeInDuration: number;
    fadeOutDuration: number;
  } {
    // Higher priority = more ducking
    const duckLevel = Math.min(0.9, 0.5 + (announcementPriority / 20));
    
    return {
      duckLevel,
      fadeInDuration: 500,  // ms
      fadeOutDuration: 800, // ms
    };
  }

  // =====================================================
  // PLAYLIST QUEUE MANAGEMENT
  // =====================================================

  async getPlaylistQueue(
    playlistId: string,
    startIndex: number = 0,
    count: number = 10,
  ): Promise<TrackResponseDto[]> {
    const playlistTracks = await this.prisma.playlistTrack.findMany({
      where: { playlistId },
      include: { track: true },
      orderBy: { order: 'asc' },
      skip: startIndex,
      take: count,
    });

    return playlistTracks.map((pt) => this.toTrackResponse(pt.track));
  }

  async addToPlaylist(
    playlistId: string,
    trackId: string,
  ): Promise<void> {
    // Get max order
    const maxOrder = await this.prisma.playlistTrack.aggregate({
      where: { playlistId },
      _max: { order: true },
    });

    await this.prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId,
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    // Update playlist duration
    await this.updatePlaylistDuration(playlistId);
  }

  async removeFromPlaylist(
    playlistId: string,
    trackId: string,
  ): Promise<void> {
    await this.prisma.playlistTrack.deleteMany({
      where: { playlistId, trackId },
    });

    await this.updatePlaylistDuration(playlistId);
  }

  async reorderPlaylist(
    playlistId: string,
    trackIds: string[],
  ): Promise<void> {
    // Use transaction for atomic update
    await this.prisma.$transaction(
      trackIds.map((trackId, index) =>
        this.prisma.playlistTrack.updateMany({
          where: { playlistId, trackId },
          data: { order: index },
        }),
      ),
    );
  }

  private async updatePlaylistDuration(playlistId: string): Promise<void> {
    const result = await this.prisma.playlistTrack.findMany({
      where: { playlistId },
      include: { track: true },
    });

    const totalDuration = result.reduce((sum, pt) => sum + pt.track.duration, 0);

    await this.prisma.playlist.update({
      where: { id: playlistId },
      data: { duration: totalDuration },
    });
  }

  // =====================================================
  // MOOD-BASED SELECTION
  // =====================================================

  async getTracksForMood(
    mood: MoodType,
    organizationId: string | null,
    count: number = 50,
  ): Promise<TrackResponseDto[]> {
    const tracks = await this.prisma.track.findMany({
      where: {
        mood: mood as any,
        OR: [
          { organizationId: null },
          { organizationId },
        ],
        isAnnouncement: false,
      },
      take: count,
      orderBy: { createdAt: 'desc' },
    });

    return tracks.map((t) => this.toTrackResponse(t));
  }

  async getRecommendedTracks(
    currentTrackId: string,
    count: number = 5,
  ): Promise<TrackResponseDto[]> {
    const currentTrack = await this.prisma.track.findUnique({
      where: { id: currentTrackId },
    });

    if (!currentTrack) {
      return [];
    }

    // Find similar tracks by mood and BPM range
    const bpmRange = 15;
    const tracks = await this.prisma.track.findMany({
      where: {
        id: { not: currentTrackId },
        mood: currentTrack.mood,
        bpm: currentTrack.bpm
          ? {
              gte: currentTrack.bpm - bpmRange,
              lte: currentTrack.bpm + bpmRange,
            }
          : undefined,
        isAnnouncement: false,
      },
      take: count,
    });

    return tracks.map((t) => this.toTrackResponse(t));
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private toTrackResponse(track: any, metadata?: TrackMetadata): TrackResponseDto {
    return {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      url: track.url,
      streamUrl: `/api/v1/music/stream/${track.id}`,
      mood: track.mood,
      bpm: track.bpm,
      genres: metadata?.genres,
      energy: metadata?.energy,
      source: metadata?.source,
      coverUrl: metadata?.coverUrl,
      isAI: track.isAI,
      waveform: metadata?.waveform,
      createdAt: track.createdAt,
    };
  }

  private inferMood(metadata: any): MoodType | undefined {
    // Simple mood inference based on BPM
    if (!metadata.bpm) return undefined;

    if (metadata.bpm < 80) return MoodType.AMBIENT;
    if (metadata.bpm < 100) return MoodType.CHILL;
    if (metadata.bpm < 120) return MoodType.LOUNGE;
    if (metadata.bpm < 140) return MoodType.POP_HITS;
    return MoodType.ENERGY;
  }
}
