// =====================================================
// DOCKFM RETAIL - CATALOG CONTROLLER
// Music Catalog & External Providers API
// =====================================================

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { MusicCatalogService, ExternalTrack, CatalogSearchResult } from './catalog.service';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: MusicCatalogService) {}

  // =====================================================
  // SEARCH
  // =====================================================

  @Get('search')
  @ApiOperation({ summary: 'Search music catalog (local + external providers)' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'genres', required: false, isArray: true })
  @ApiQuery({ name: 'moods', required: false, isArray: true })
  @ApiQuery({ name: 'minBpm', required: false, type: Number })
  @ApiQuery({ name: 'maxBpm', required: false, type: Number })
  @ApiQuery({ name: 'minDuration', required: false, type: Number })
  @ApiQuery({ name: 'maxDuration', required: false, type: Number })
  @ApiQuery({ name: 'sources', required: false, isArray: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200 })
  async searchCatalog(
    @Query('query') query?: string,
    @Query('genres') genres?: string | string[],
    @Query('moods') moods?: string | string[],
    @Query('minBpm') minBpm?: number,
    @Query('maxBpm') maxBpm?: number,
    @Query('minDuration') minDuration?: number,
    @Query('maxDuration') maxDuration?: number,
    @Query('sources') sources?: string | string[],
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<CatalogSearchResult> {
    return this.catalogService.searchCatalog({
      query,
      genres: Array.isArray(genres) ? genres : genres ? [genres] : undefined,
      moods: Array.isArray(moods) ? moods : moods ? [moods] : undefined,
      minBpm: minBpm ? Number(minBpm) : undefined,
      maxBpm: maxBpm ? Number(maxBpm) : undefined,
      minDuration: minDuration ? Number(minDuration) : undefined,
      maxDuration: maxDuration ? Number(maxDuration) : undefined,
      sources: Array.isArray(sources) ? sources : sources ? [sources] : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  // =====================================================
  // IMPORT
  // =====================================================

  @Post('import')
  @ApiOperation({ summary: 'Import track from external source to local library' })
  @ApiResponse({ status: 201 })
  async importTrack(
    @Body() track: ExternalTrack,
    @Body('organizationId') organizationId?: string,
  ) {
    return this.catalogService.importTrack(track, organizationId || null);
  }

  @Post('import/bulk')
  @ApiOperation({ summary: 'Import multiple tracks' })
  @ApiResponse({ status: 201 })
  async importBulk(
    @Body('tracks') tracks: ExternalTrack[],
    @Body('organizationId') organizationId?: string,
  ) {
    return this.catalogService.importBulk(tracks, organizationId || null);
  }

  // =====================================================
  // CURATED CONTENT
  // =====================================================

  @Get('curated')
  @ApiOperation({ summary: 'Get curated playlist by mood' })
  @ApiQuery({ name: 'mood', required: true })
  @ApiQuery({ name: 'duration', required: false, type: Number })
  @ApiResponse({ status: 200, type: [Object] })
  async getCuratedPlaylist(
    @Query('mood') mood: string,
    @Query('duration') duration?: number,
  ): Promise<ExternalTrack[]> {
    return this.catalogService.getCuratedPlaylist(
      mood,
      duration ? Number(duration) : 3600,
    );
  }

  // =====================================================
  // METADATA
  // =====================================================

  @Get('moods')
  @ApiOperation({ summary: 'Get available mood types' })
  @ApiResponse({ status: 200, type: [String] })
  async getAvailableMoods(): Promise<string[]> {
    return this.catalogService.getAvailableMoods();
  }

  @Get('genres')
  @ApiOperation({ summary: 'Get available genre types' })
  @ApiResponse({ status: 200, type: [String] })
  async getAvailableGenres(): Promise<string[]> {
    return this.catalogService.getAvailableGenres();
  }

  // =====================================================
  // PROVIDER STATUS
  // =====================================================

  @Get('providers')
  @ApiOperation({ summary: 'Get available music providers status' })
  @ApiResponse({ status: 200 })
  async getProviders() {
    const jamendoKey = process.env.JAMENDO_API_KEY;
    const pixabayKey = process.env.PIXABAY_API_KEY;

    return {
      providers: [
        {
          id: 'LOCAL',
          name: 'Local Library',
          status: 'active',
          description: 'Your uploaded and imported tracks',
        },
        {
          id: 'JAMENDO',
          name: 'Jamendo',
          status: jamendoKey ? 'active' : 'inactive',
          description: 'Creative Commons licensed music',
          apiKeyRequired: !jamendoKey,
        },
        {
          id: 'PIXABAY',
          name: 'Pixabay Music',
          status: pixabayKey ? 'active' : 'inactive',
          description: 'Free commercial-use music',
          apiKeyRequired: !pixabayKey,
        },
      ],
    };
  }
}
