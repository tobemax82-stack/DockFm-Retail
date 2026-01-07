// =====================================================
// DOCKFM RETAIL - SYNC CONTROLLER
// Offline Sync API for Players
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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SyncService } from './sync.service';
import {
  SyncManifestDto,
  SyncStatusDto,
  SyncConfigDto,
  HeartbeatDto,
  HeartbeatResponseDto,
  RequestSyncDto,
  UpdateSyncProgressDto,
  OfflineStorageInfoDto,
  SyncItemType,
  SyncCommandDto,
} from './dto';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  // =====================================================
  // MANIFEST
  // =====================================================

  @Get(':storeId/manifest')
  @ApiOperation({ summary: 'Get sync manifest for store' })
  @ApiParam({ name: 'storeId', type: 'string' })
  @ApiResponse({ status: 200, type: SyncManifestDto })
  async getManifest(
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ): Promise<SyncManifestDto> {
    return this.syncService.generateManifest(storeId);
  }

  @Post('request')
  @ApiOperation({ summary: 'Request sync for store' })
  @ApiResponse({ status: 201, type: SyncManifestDto })
  async requestSync(@Body() dto: RequestSyncDto): Promise<SyncManifestDto> {
    return this.syncService.requestSync(dto);
  }

  // =====================================================
  // STATUS
  // =====================================================

  @Get(':storeId/status')
  @ApiOperation({ summary: 'Get sync status for store' })
  @ApiParam({ name: 'storeId', type: 'string' })
  @ApiResponse({ status: 200, type: SyncStatusDto })
  async getSyncStatus(
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ): Promise<SyncStatusDto> {
    return this.syncService.getSyncStatus(storeId);
  }

  @Put(':storeId/progress')
  @ApiOperation({ summary: 'Update sync progress' })
  @ApiParam({ name: 'storeId', type: 'string' })
  @ApiResponse({ status: 200 })
  async updateProgress(@Body() dto: UpdateSyncProgressDto): Promise<void> {
    return this.syncService.updateSyncProgress(
      dto.storeId,
      dto.itemId,
      dto.status,
      dto.bytesDownloaded,
      dto.error,
    );
  }

  // =====================================================
  // HEARTBEAT
  // =====================================================

  @Post('heartbeat')
  @ApiOperation({ summary: 'Player heartbeat' })
  @ApiResponse({ status: 200, type: HeartbeatResponseDto })
  async heartbeat(@Body() dto: HeartbeatDto): Promise<HeartbeatResponseDto> {
    return this.syncService.processHeartbeat(dto);
  }

  // =====================================================
  // COMMANDS
  // =====================================================

  @Post(':storeId/command')
  @ApiOperation({ summary: 'Send command to store player' })
  @ApiParam({ name: 'storeId', type: 'string' })
  @ApiResponse({ status: 201 })
  async sendCommand(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Body() command: SyncCommandDto,
  ): Promise<void> {
    return this.syncService.sendCommand(storeId, command);
  }

  @Post(':storeId/trigger-sync')
  @ApiOperation({ summary: 'Trigger immediate sync for store' })
  @ApiParam({ name: 'storeId', type: 'string' })
  @ApiResponse({ status: 201 })
  async triggerSync(
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ): Promise<void> {
    return this.syncService.triggerSync(storeId);
  }

  @Post(':storeId/reload')
  @ApiOperation({ summary: 'Trigger player reload' })
  @ApiParam({ name: 'storeId', type: 'string' })
  @ApiResponse({ status: 201 })
  async triggerReload(
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ): Promise<void> {
    return this.syncService.triggerReload(storeId);
  }

  // =====================================================
  // CONFIG
  // =====================================================

  @Get(':storeId/config')
  @ApiOperation({ summary: 'Get sync configuration' })
  @ApiParam({ name: 'storeId', type: 'string' })
  @ApiResponse({ status: 200, type: SyncConfigDto })
  async getSyncConfig(
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ): Promise<SyncConfigDto> {
    return this.syncService.getSyncConfig(storeId);
  }

  @Put(':storeId/config')
  @ApiOperation({ summary: 'Update sync configuration' })
  @ApiParam({ name: 'storeId', type: 'string' })
  @ApiResponse({ status: 200, type: SyncConfigDto })
  async updateSyncConfig(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Body() config: Partial<SyncConfigDto>,
  ): Promise<SyncConfigDto> {
    return this.syncService.updateSyncConfig(storeId, config);
  }

  // =====================================================
  // STORAGE
  // =====================================================

  @Get(':storeId/storage')
  @ApiOperation({ summary: 'Get offline storage info' })
  @ApiParam({ name: 'storeId', type: 'string' })
  @ApiResponse({ status: 200, type: OfflineStorageInfoDto })
  async getStorageInfo(
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ): Promise<OfflineStorageInfoDto> {
    return this.syncService.getStorageInfo(storeId);
  }

  @Delete(':storeId/cache')
  @ApiOperation({ summary: 'Clear offline cache' })
  @ApiParam({ name: 'storeId', type: 'string' })
  @ApiQuery({ name: 'types', required: false, isArray: true })
  @ApiResponse({ status: 204 })
  async clearCache(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Query('types') types?: string | string[],
  ): Promise<void> {
    const itemTypes = types
      ? (Array.isArray(types) ? types : [types]).map(t => t as SyncItemType)
      : undefined;
    
    return this.syncService.clearCache(storeId, itemTypes);
  }

  // =====================================================
  // SCHEDULE & CONFIG DATA
  // =====================================================

  @Get(':storeId/schedule')
  @ApiOperation({ summary: 'Get schedule configuration for offline use' })
  @ApiParam({ name: 'storeId', type: 'string' })
  async getScheduleConfig(
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    // This endpoint would return the full schedule configuration
    // that the player can use offline
    return {
      storeId,
      // Would fetch from database
      rules: [],
      generatedAt: new Date().toISOString(),
    };
  }

  @Get(':storeId/config/full')
  @ApiOperation({ summary: 'Get full store configuration for offline use' })
  @ApiParam({ name: 'storeId', type: 'string' })
  async getFullConfig(
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    // This endpoint would return all configuration needed for offline operation
    return {
      storeId,
      settings: {},
      schedule: {},
      playlists: [],
      announcements: [],
      generatedAt: new Date().toISOString(),
    };
  }
}
