// =====================================================
// DOCKFM RETAIL - MUSIC CATALOG SERVICE
// External Music Providers Integration
// =====================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// =====================================================
// INTERFACES
// =====================================================

export interface ExternalTrack {
  externalId: string;
  source: 'JAMENDO' | 'PIXABAY' | 'FREESOUND' | 'LOCAL';
  title: string;
  artist: string;
  album?: string;
  duration: number;
  url: string;
  previewUrl?: string;
  downloadUrl?: string;
  coverUrl?: string;
  license: string;
  licenseUrl?: string;
  tags: string[];
  genres: string[];
  mood?: string;
  bpm?: number;
  energy?: number;
}

export interface CatalogSearchParams {
  query?: string;
  genres?: string[];
  moods?: string[];
  minBpm?: number;
  maxBpm?: number;
  minDuration?: number;
  maxDuration?: number;
  sources?: string[];
  page?: number;
  limit?: number;
}

export interface CatalogSearchResult {
  tracks: ExternalTrack[];
  total: number;
  page: number;
  totalPages: number;
  sources: { [key: string]: number };
}

// =====================================================
// CATALOG SERVICE
// =====================================================

@Injectable()
export class MusicCatalogService {
  private readonly logger = new Logger(MusicCatalogService.name);
  
  // API keys from environment
  private readonly jamendoApiKey: string;
  private readonly pixabayApiKey: string;

  constructor(private prisma: PrismaService) {
    this.jamendoApiKey = process.env.JAMENDO_API_KEY || '';
    this.pixabayApiKey = process.env.PIXABAY_API_KEY || '';
  }

  // =====================================================
  // UNIFIED SEARCH
  // =====================================================

  async searchCatalog(params: CatalogSearchParams): Promise<CatalogSearchResult> {
    const { page = 1, limit = 20, sources } = params;
    const enabledSources = sources || ['LOCAL', 'JAMENDO', 'PIXABAY'];
    
    const results: ExternalTrack[] = [];
    const sourceCounts: { [key: string]: number } = {};

    // Search local database
    if (enabledSources.includes('LOCAL')) {
      const localTracks = await this.searchLocal(params);
      results.push(...localTracks);
      sourceCounts['LOCAL'] = localTracks.length;
    }

    // Search Jamendo (if API key available)
    if (enabledSources.includes('JAMENDO') && this.jamendoApiKey) {
      try {
        const jamendoTracks = await this.searchJamendo(params);
        results.push(...jamendoTracks);
        sourceCounts['JAMENDO'] = jamendoTracks.length;
      } catch (error) {
        this.logger.error('Jamendo search failed', error);
        sourceCounts['JAMENDO'] = 0;
      }
    }

    // Search Pixabay (if API key available)
    if (enabledSources.includes('PIXABAY') && this.pixabayApiKey) {
      try {
        const pixabayTracks = await this.searchPixabay(params);
        results.push(...pixabayTracks);
        sourceCounts['PIXABAY'] = pixabayTracks.length;
      } catch (error) {
        this.logger.error('Pixabay search failed', error);
        sourceCounts['PIXABAY'] = 0;
      }
    }

    // Sort and paginate combined results
    const sortedResults = this.sortByRelevance(results, params.query);
    const startIndex = (page - 1) * limit;
    const paginatedResults = sortedResults.slice(startIndex, startIndex + limit);

    return {
      tracks: paginatedResults,
      total: results.length,
      page,
      totalPages: Math.ceil(results.length / limit),
      sources: sourceCounts,
    };
  }

  // =====================================================
  // LOCAL DATABASE SEARCH
  // =====================================================

  private async searchLocal(params: CatalogSearchParams): Promise<ExternalTrack[]> {
    const where: any = {
      organizationId: null, // Global tracks only
      isAnnouncement: false,
    };

    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: 'insensitive' } },
        { artist: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    if (params.minBpm || params.maxBpm) {
      where.bpm = {};
      if (params.minBpm) where.bpm.gte = params.minBpm;
      if (params.maxBpm) where.bpm.lte = params.maxBpm;
    }

    if (params.minDuration || params.maxDuration) {
      where.duration = {};
      if (params.minDuration) where.duration.gte = params.minDuration;
      if (params.maxDuration) where.duration.lte = params.maxDuration;
    }

    const tracks = await this.prisma.track.findMany({
      where,
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    return tracks.map((track) => ({
      externalId: track.id,
      source: 'LOCAL' as const,
      title: track.title,
      artist: track.artist || 'Unknown',
      album: track.album || undefined,
      duration: track.duration,
      url: track.url,
      license: 'Royalty-Free',
      tags: [],
      genres: [],
      mood: track.mood || undefined,
      bpm: track.bpm || undefined,
    }));
  }

  // =====================================================
  // JAMENDO INTEGRATION
  // =====================================================

  private async searchJamendo(params: CatalogSearchParams): Promise<ExternalTrack[]> {
    const apiUrl = new URL('https://api.jamendo.com/v3.0/tracks');
    apiUrl.searchParams.set('client_id', this.jamendoApiKey);
    apiUrl.searchParams.set('format', 'json');
    apiUrl.searchParams.set('limit', '50');
    apiUrl.searchParams.set('include', 'musicinfo');
    apiUrl.searchParams.set('audioformat', 'mp32');
    
    // Commercial-friendly license
    apiUrl.searchParams.set('ccnc', '0'); // Allow commercial use

    if (params.query) {
      apiUrl.searchParams.set('search', params.query);
    }

    if (params.genres?.length) {
      apiUrl.searchParams.set('tags', params.genres.join('+'));
    }

    if (params.minBpm || params.maxBpm) {
      if (params.minBpm) apiUrl.searchParams.set('speed_min', String(params.minBpm));
      if (params.maxBpm) apiUrl.searchParams.set('speed_max', String(params.maxBpm));
    }

    if (params.minDuration) {
      apiUrl.searchParams.set('durationbetween', `${params.minDuration}_${params.maxDuration || 600}`);
    }

    try {
      const response = await fetch(apiUrl.toString());
      const data = await response.json();

      if (!data.results) return [];

      return data.results.map((track: any) => ({
        externalId: track.id,
        source: 'JAMENDO' as const,
        title: track.name,
        artist: track.artist_name,
        album: track.album_name,
        duration: parseInt(track.duration),
        url: track.audio,
        previewUrl: track.audiodownload,
        downloadUrl: track.audiodownload,
        coverUrl: track.album_image || track.image,
        license: 'CC BY-NC-SA',
        licenseUrl: track.license_ccurl,
        tags: track.musicinfo?.tags?.split(', ') || [],
        genres: track.musicinfo?.tags?.split(', ') || [],
        mood: this.mapJamendoMood(track.musicinfo?.tags),
        bpm: track.musicinfo?.speed ? parseInt(track.musicinfo.speed) : undefined,
        energy: this.mapJamendoEnergy(track.musicinfo?.tags),
      }));
    } catch (error) {
      this.logger.error('Jamendo API error', error);
      return [];
    }
  }

  private mapJamendoMood(tags: string): string | undefined {
    if (!tags) return undefined;
    const tagList = tags.toLowerCase();
    
    if (tagList.includes('chill') || tagList.includes('relax')) return 'CHILL';
    if (tagList.includes('ambient')) return 'AMBIENT';
    if (tagList.includes('jazz')) return 'SOFT_JAZZ';
    if (tagList.includes('lounge')) return 'LOUNGE';
    if (tagList.includes('acoustic')) return 'MORNING_ACOUSTIC';
    if (tagList.includes('energy') || tagList.includes('upbeat')) return 'ENERGY';
    if (tagList.includes('pop')) return 'POP_HITS';
    
    return undefined;
  }

  private mapJamendoEnergy(tags: string): number | undefined {
    if (!tags) return undefined;
    const tagList = tags.toLowerCase();
    
    if (tagList.includes('chill') || tagList.includes('relax') || tagList.includes('calm')) return 3;
    if (tagList.includes('ambient') || tagList.includes('soft')) return 2;
    if (tagList.includes('medium') || tagList.includes('moderate')) return 5;
    if (tagList.includes('upbeat') || tagList.includes('happy')) return 7;
    if (tagList.includes('energy') || tagList.includes('fast')) return 9;
    
    return 5;
  }

  // =====================================================
  // PIXABAY INTEGRATION
  // =====================================================

  private async searchPixabay(params: CatalogSearchParams): Promise<ExternalTrack[]> {
    const apiUrl = new URL('https://pixabay.com/api/music/');
    apiUrl.searchParams.set('key', this.pixabayApiKey);
    apiUrl.searchParams.set('per_page', '50');

    if (params.query) {
      apiUrl.searchParams.set('q', params.query);
    }

    if (params.genres?.length) {
      // Pixabay uses category
      const genreMap: { [key: string]: string } = {
        'jazz': 'jazz_swing',
        'electronic': 'beats',
        'ambient': 'ambient_cinematic',
        'pop': 'beats',
        'classical': 'classical',
      };
      const category = params.genres.find(g => genreMap[g.toLowerCase()]);
      if (category) {
        apiUrl.searchParams.set('category', genreMap[category.toLowerCase()]);
      }
    }

    try {
      const response = await fetch(apiUrl.toString());
      const data = await response.json();

      if (!data.hits) return [];

      return data.hits.map((track: any) => ({
        externalId: String(track.id),
        source: 'PIXABAY' as const,
        title: track.title || 'Untitled',
        artist: track.user || 'Unknown',
        duration: track.duration,
        url: track.audio || track.url,
        previewUrl: track.preview,
        downloadUrl: track.audio,
        coverUrl: undefined,
        license: 'Pixabay License (Free for commercial use)',
        licenseUrl: 'https://pixabay.com/service/license/',
        tags: track.tags?.split(', ') || [],
        genres: [track.category || 'other'],
        mood: this.mapPixabayMood(track.category),
        energy: track.energy,
      }));
    } catch (error) {
      this.logger.error('Pixabay API error', error);
      return [];
    }
  }

  private mapPixabayMood(category: string): string | undefined {
    if (!category) return undefined;
    
    const moodMap: { [key: string]: string } = {
      'jazz_swing': 'SOFT_JAZZ',
      'ambient_cinematic': 'AMBIENT',
      'beats': 'ENERGY',
      'classical': 'LOUNGE',
      'acoustic_folk': 'MORNING_ACOUSTIC',
    };
    
    return moodMap[category];
  }

  // =====================================================
  // IMPORT TO LOCAL LIBRARY
  // =====================================================

  async importTrack(externalTrack: ExternalTrack, organizationId: string | null = null) {
    // Check if already imported
    const existing = await this.prisma.track.findFirst({
      where: {
        organizationId,
        // Would need custom field for external source tracking
      },
    });

    if (existing) {
      this.logger.log(`Track already imported: ${externalTrack.title}`);
      return existing;
    }

    const track = await this.prisma.track.create({
      data: {
        title: externalTrack.title,
        artist: externalTrack.artist,
        album: externalTrack.album,
        duration: externalTrack.duration,
        url: externalTrack.url,
        mood: externalTrack.mood as any,
        bpm: externalTrack.bpm,
        isAI: false,
        organizationId,
      },
    });

    this.logger.log(`Imported track from ${externalTrack.source}: ${externalTrack.title}`);
    return track;
  }

  async importBulk(tracks: ExternalTrack[], organizationId: string | null = null) {
    const results = [];
    
    for (const track of tracks) {
      try {
        const imported = await this.importTrack(track, organizationId);
        results.push({ success: true, track: imported });
      } catch (error) {
        results.push({ success: false, error: error.message, track: track });
      }
    }

    return {
      imported: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  // =====================================================
  // MOOD & GENRE HELPERS
  // =====================================================

  getAvailableMoods(): string[] {
    return [
      'MORNING_ACOUSTIC',
      'SOFT_JAZZ',
      'LOUNGE',
      'ENERGY',
      'POP_HITS',
      'AMBIENT',
      'ITALIAN',
      'CHILL',
      'CUSTOM',
    ];
  }

  getAvailableGenres(): string[] {
    return [
      'acoustic',
      'ambient',
      'blues',
      'bossa-nova',
      'chill',
      'classical',
      'country',
      'electronic',
      'funk',
      'hip-hop',
      'house',
      'indie',
      'jazz',
      'latin',
      'lofi',
      'lounge',
      'pop',
      'r&b',
      'reggae',
      'rock',
      'soul',
      'world',
    ];
  }

  // =====================================================
  // SORTING & RELEVANCE
  // =====================================================

  private sortByRelevance(tracks: ExternalTrack[], query?: string): ExternalTrack[] {
    if (!query) return tracks;

    const queryLower = query.toLowerCase();
    
    return tracks.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, queryLower);
      const bScore = this.calculateRelevanceScore(b, queryLower);
      return bScore - aScore;
    });
  }

  private calculateRelevanceScore(track: ExternalTrack, query: string): number {
    let score = 0;

    // Exact title match
    if (track.title.toLowerCase() === query) score += 100;
    // Title contains query
    else if (track.title.toLowerCase().includes(query)) score += 50;

    // Artist match
    if (track.artist.toLowerCase().includes(query)) score += 30;

    // Tags/genres match
    track.tags.forEach(tag => {
      if (tag.toLowerCase().includes(query)) score += 10;
    });

    // Prefer local tracks
    if (track.source === 'LOCAL') score += 20;

    // Prefer tracks with more metadata
    if (track.bpm) score += 5;
    if (track.mood) score += 5;
    if (track.coverUrl) score += 3;

    return score;
  }

  // =====================================================
  // CURATED PLAYLISTS BY MOOD
  // =====================================================

  async getCuratedPlaylist(
    mood: string,
    duration: number = 3600, // 1 hour default
  ): Promise<ExternalTrack[]> {
    const tracks: ExternalTrack[] = [];
    let totalDuration = 0;

    // Search for tracks matching mood
    const searchResult = await this.searchCatalog({
      moods: [mood],
      limit: 100,
    });

    // Shuffle and select tracks to fill duration
    const shuffled = this.shuffleArray([...searchResult.tracks]);
    
    for (const track of shuffled) {
      if (totalDuration >= duration) break;
      tracks.push(track);
      totalDuration += track.duration;
    }

    return tracks;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
