// =====================================================
// DOCKFM RETAIL - SYNC DTOs
// Offline Sync Data Transfer Objects
// =====================================================

import { IsString, IsOptional, IsInt, IsEnum, IsBoolean, IsArray, IsUUID, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// =====================================================
// ENUMS
// =====================================================

export enum SyncStatus {
  PENDING = 'PENDING',
  DOWNLOADING = 'DOWNLOADING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PAUSED = 'PAUSED',
}

export enum SyncPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum SyncItemType {
  TRACK = 'TRACK',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  PLAYLIST = 'PLAYLIST',
  SCHEDULE = 'SCHEDULE',
  CONFIG = 'CONFIG',
}

// =====================================================
// SYNC MANIFEST DTO
// =====================================================

export class SyncManifestDto {
  @ApiProperty({ description: 'Store ID' })
  @IsUUID()
  storeId: string;

  @ApiProperty({ description: 'Manifest version' })
  @IsInt()
  version: number;

  @ApiProperty({ description: 'Generated timestamp' })
  @IsDateString()
  generatedAt: string;

  @ApiProperty({ description: 'Items to sync', type: [Object] })
  @IsArray()
  items: SyncItemDto[];

  @ApiProperty({ description: 'Total size in bytes' })
  @IsInt()
  totalSize: number;

  @ApiProperty({ description: 'Estimated download time (seconds)' })
  @IsInt()
  estimatedTime: number;
}

export class SyncItemDto {
  @ApiProperty({ description: 'Item ID' })
  @IsString()
  id: string;

  @ApiProperty({ enum: SyncItemType })
  @IsEnum(SyncItemType)
  type: SyncItemType;

  @ApiProperty({ description: 'Item name/title' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Download URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsInt()
  size: number;

  @ApiProperty({ description: 'File checksum (SHA-256)' })
  @IsString()
  checksum: string;

  @ApiProperty({ enum: SyncPriority })
  @IsEnum(SyncPriority)
  priority: SyncPriority;

  @ApiPropertyOptional({ description: 'Last modified date' })
  @IsDateString()
  @IsOptional()
  lastModified?: string;

  @ApiPropertyOptional({ description: 'Metadata JSON' })
  @IsOptional()
  metadata?: any;
}

// =====================================================
// SYNC STATUS DTO
// =====================================================

export class SyncStatusDto {
  @ApiProperty({ description: 'Store ID' })
  storeId: string;

  @ApiProperty({ enum: SyncStatus })
  status: SyncStatus;

  @ApiProperty({ description: 'Last sync timestamp' })
  lastSyncAt: string | null;

  @ApiProperty({ description: 'Next scheduled sync' })
  nextSyncAt: string | null;

  @ApiProperty({ description: 'Current manifest version' })
  manifestVersion: number;

  @ApiProperty({ description: 'Local manifest version' })
  localVersion: number;

  @ApiProperty({ description: 'Items pending sync' })
  pendingItems: number;

  @ApiProperty({ description: 'Download progress (0-100)' })
  progress: number;

  @ApiProperty({ description: 'Bytes downloaded' })
  bytesDownloaded: number;

  @ApiProperty({ description: 'Total bytes to download' })
  totalBytes: number;

  @ApiProperty({ description: 'Current download speed (bytes/sec)' })
  downloadSpeed: number;

  @ApiProperty({ description: 'Estimated time remaining (seconds)' })
  estimatedTimeRemaining: number;

  @ApiProperty({ description: 'Is offline mode active' })
  isOfflineMode: boolean;

  @ApiProperty({ description: 'Error message if any' })
  error: string | null;
}

// =====================================================
// SYNC REQUEST DTOs
// =====================================================

export class RequestSyncDto {
  @ApiProperty({ description: 'Store ID' })
  @IsUUID()
  storeId: string;

  @ApiPropertyOptional({ description: 'Force full sync' })
  @IsBoolean()
  @IsOptional()
  forceFullSync?: boolean;

  @ApiPropertyOptional({ enum: SyncPriority })
  @IsEnum(SyncPriority)
  @IsOptional()
  priority?: SyncPriority;

  @ApiPropertyOptional({ description: 'Item types to sync' })
  @IsArray()
  @IsEnum(SyncItemType, { each: true })
  @IsOptional()
  itemTypes?: SyncItemType[];
}

export class UpdateSyncProgressDto {
  @ApiProperty({ description: 'Store ID' })
  @IsUUID()
  storeId: string;

  @ApiProperty({ description: 'Item ID' })
  @IsString()
  itemId: string;

  @ApiProperty({ enum: SyncStatus })
  @IsEnum(SyncStatus)
  status: SyncStatus;

  @ApiPropertyOptional({ description: 'Bytes downloaded' })
  @IsInt()
  @IsOptional()
  bytesDownloaded?: number;

  @ApiPropertyOptional({ description: 'Error message' })
  @IsString()
  @IsOptional()
  error?: string;
}

// =====================================================
// SYNC CONFIG DTO
// =====================================================

export class SyncConfigDto {
  @ApiPropertyOptional({ description: 'Enable auto sync' })
  @IsBoolean()
  @IsOptional()
  autoSync?: boolean;

  @ApiPropertyOptional({ description: 'Sync interval (minutes)' })
  @IsInt()
  @IsOptional()
  @Min(5)
  @Max(1440) // Max 24 hours
  syncIntervalMinutes?: number;

  @ApiPropertyOptional({ description: 'Preferred sync hours (night)' })
  @IsArray()
  @IsOptional()
  preferredSyncHours?: number[];

  @ApiPropertyOptional({ description: 'Max concurrent downloads' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  maxConcurrentDownloads?: number;

  @ApiPropertyOptional({ description: 'Download only on WiFi (for mobile)' })
  @IsBoolean()
  @IsOptional()
  wifiOnly?: boolean;

  @ApiPropertyOptional({ description: 'Max local storage (MB)' })
  @IsInt()
  @IsOptional()
  @Min(100)
  maxStorageMB?: number;

  @ApiPropertyOptional({ description: 'Preload hours ahead' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(48)
  preloadHoursAhead?: number;

  @ApiPropertyOptional({ description: 'Keep offline days' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(30)
  keepOfflineDays?: number;
}

// =====================================================
// HEARTBEAT DTO
// =====================================================

export class HeartbeatDto {
  @ApiProperty({ description: 'Store ID' })
  @IsUUID()
  storeId: string;

  @ApiProperty({ description: 'Player version' })
  @IsString()
  playerVersion: string;

  @ApiProperty({ description: 'OS info' })
  @IsString()
  osInfo: string;

  @ApiProperty({ description: 'Is playing' })
  @IsBoolean()
  isPlaying: boolean;

  @ApiProperty({ description: 'Current track ID' })
  @IsString()
  @IsOptional()
  currentTrackId?: string;

  @ApiProperty({ description: 'Playback position (seconds)' })
  @IsInt()
  @IsOptional()
  playbackPosition?: number;

  @ApiProperty({ description: 'Volume level' })
  @IsInt()
  @Min(0)
  @Max(100)
  volume: number;

  @ApiProperty({ description: 'Is offline mode' })
  @IsBoolean()
  isOfflineMode: boolean;

  @ApiProperty({ description: 'Local storage used (MB)' })
  @IsInt()
  storageUsedMB: number;

  @ApiProperty({ description: 'CPU usage (%)' })
  @IsInt()
  @IsOptional()
  cpuUsage?: number;

  @ApiProperty({ description: 'Memory usage (%)' })
  @IsInt()
  @IsOptional()
  memoryUsage?: number;

  @ApiProperty({ description: 'Network status' })
  @IsString()
  networkStatus: 'online' | 'offline' | 'slow';

  @ApiProperty({ description: 'Local manifest version' })
  @IsInt()
  localManifestVersion: number;
}

export class HeartbeatResponseDto {
  @ApiProperty({ description: 'Server time' })
  serverTime: string;

  @ApiProperty({ description: 'Commands to execute' })
  commands: SyncCommandDto[];

  @ApiProperty({ description: 'Sync needed' })
  syncNeeded: boolean;

  @ApiProperty({ description: 'New manifest version available' })
  newManifestVersion: number | null;

  @ApiProperty({ description: 'Player update available' })
  updateAvailable: boolean;

  @ApiProperty({ description: 'Update URL' })
  updateUrl: string | null;
}

export class SyncCommandDto {
  @ApiProperty({ description: 'Command type' })
  type: 'SYNC' | 'PLAY' | 'PAUSE' | 'STOP' | 'VOLUME' | 'RELOAD' | 'UPDATE' | 'RESTART';

  @ApiProperty({ description: 'Command payload' })
  payload: any;

  @ApiProperty({ description: 'Command priority' })
  priority: number;
}

// =====================================================
// OFFLINE STORAGE INFO
// =====================================================

export class OfflineStorageInfoDto {
  @ApiProperty({ description: 'Store ID' })
  storeId: string;

  @ApiProperty({ description: 'Total storage (bytes)' })
  totalStorage: number;

  @ApiProperty({ description: 'Used storage (bytes)' })
  usedStorage: number;

  @ApiProperty({ description: 'Available storage (bytes)' })
  availableStorage: number;

  @ApiProperty({ description: 'Usage percentage' })
  usagePercent: number;

  @ApiProperty({ description: 'Cached tracks count' })
  cachedTracks: number;

  @ApiProperty({ description: 'Cached announcements count' })
  cachedAnnouncements: number;

  @ApiProperty({ description: 'Cache breakdown by type' })
  breakdown: {
    tracks: number;
    announcements: number;
    playlists: number;
    configs: number;
    other: number;
  };

  @ApiProperty({ description: 'Oldest cached item date' })
  oldestCacheDate: string | null;

  @ApiProperty({ description: 'Newest cached item date' })
  newestCacheDate: string | null;
}
