// =====================================================
// DOCKFM RETAIL - SYNC SERVICE
// Offline Sync Management for Players
// =====================================================

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import {
  SyncManifestDto,
  SyncItemDto,
  SyncStatusDto,
  SyncConfigDto,
  SyncStatus,
  SyncPriority,
  SyncItemType,
  HeartbeatDto,
  HeartbeatResponseDto,
  SyncCommandDto,
  OfflineStorageInfoDto,
  RequestSyncDto,
} from './dto';

// =====================================================
// INTERFACES
// =====================================================

interface StoreSync {
  storeId: string;
  status: SyncStatus;
  lastSyncAt: Date | null;
  manifestVersion: number;
  localVersion: number;
  config: SyncConfigDto;
  pendingCommands: SyncCommandDto[];
  lastHeartbeat: Date | null;
}

interface SyncQueueItem {
  itemId: string;
  storeId: string;
  type: SyncItemType;
  priority: SyncPriority;
  status: SyncStatus;
  bytesDownloaded: number;
  totalBytes: number;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// SERVICE
// =====================================================

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  
  // In-memory state (would be Redis in production)
  private storeSyncs: Map<string, StoreSync> = new Map();
  private syncQueue: Map<string, SyncQueueItem[]> = new Map();
  private manifestVersions: Map<string, number> = new Map();

  // Default sync config
  private readonly defaultConfig: SyncConfigDto = {
    autoSync: true,
    syncIntervalMinutes: 60,
    preferredSyncHours: [2, 3, 4, 5], // 2 AM - 5 AM
    maxConcurrentDownloads: 2,
    wifiOnly: false,
    maxStorageMB: 5000, // 5 GB
    preloadHoursAhead: 24,
    keepOfflineDays: 7,
  };

  constructor(private prisma: PrismaService) {}

  // =====================================================
  // MANIFEST GENERATION
  // =====================================================

  async generateManifest(storeId: string): Promise<SyncManifestDto> {
    this.logger.log(`Generating sync manifest for store: ${storeId}`);

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        organization: {
          include: {
            playlists: {
              include: {
                tracks: {
                  include: { track: true },
                },
              },
            },
            announcements: {
              where: { status: 'ACTIVE' },
            },
            scheduleRules: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store ${storeId} not found`);
    }

    const items: SyncItemDto[] = [];
    let totalSize = 0;

    // Add tracks from playlists
    const trackIds = new Set<string>();
    for (const playlist of store.organization.playlists) {
      for (const pt of playlist.tracks) {
        if (!trackIds.has(pt.track.id)) {
          trackIds.add(pt.track.id);
          
          const item = this.createSyncItem(
            pt.track.id,
            SyncItemType.TRACK,
            pt.track.title,
            pt.track.url,
            this.estimateTrackSize(pt.track.duration),
            SyncPriority.NORMAL,
            {
              artist: pt.track.artist,
              duration: pt.track.duration,
              mood: pt.track.mood,
            },
          );
          
          items.push(item);
          totalSize += item.size;
        }
      }
    }

    // Add announcements
    for (const announcement of store.organization.announcements) {
      if (announcement.audioUrl) {
        const item = this.createSyncItem(
          announcement.id,
          SyncItemType.ANNOUNCEMENT,
          announcement.name,
          announcement.audioUrl,
          this.estimateTrackSize(announcement.duration),
          SyncPriority.HIGH, // Announcements are higher priority
          {
            type: announcement.type,
            priority: announcement.priority,
          },
        );
        
        items.push(item);
        totalSize += item.size;
      }
    }

    // Add schedule rules as config
    const scheduleConfig = this.createSyncItem(
      `schedule_${storeId}`,
      SyncItemType.SCHEDULE,
      'Schedule Configuration',
      `/api/v1/sync/${storeId}/schedule`,
      1024, // ~1KB
      SyncPriority.CRITICAL,
      { rules: store.organization.scheduleRules },
    );
    items.push(scheduleConfig);
    totalSize += scheduleConfig.size;

    // Add store config
    const storeConfig = this.createSyncItem(
      `config_${storeId}`,
      SyncItemType.CONFIG,
      'Store Configuration',
      `/api/v1/sync/${storeId}/config`,
      512,
      SyncPriority.CRITICAL,
      { settings: store.settings, schedule: store.schedule },
    );
    items.push(storeConfig);
    totalSize += storeConfig.size;

    // Sort by priority
    items.sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Update manifest version
    const version = this.getNextManifestVersion(storeId);
    this.manifestVersions.set(storeId, version);

    // Estimate download time (assuming 5 Mbps average connection)
    const estimatedTime = Math.ceil(totalSize / (5 * 1024 * 1024 / 8));

    return {
      storeId,
      version,
      generatedAt: new Date().toISOString(),
      items,
      totalSize,
      estimatedTime,
    };
  }

  private createSyncItem(
    id: string,
    type: SyncItemType,
    name: string,
    url: string,
    size: number,
    priority: SyncPriority,
    metadata?: any,
  ): SyncItemDto {
    return {
      id,
      type,
      name,
      url,
      size,
      checksum: this.generateChecksum(`${id}_${url}`),
      priority,
      lastModified: new Date().toISOString(),
      metadata,
    };
  }

  private estimateTrackSize(durationSeconds: number): number {
    // Estimate based on 128kbps AAC
    const bitrate = 128000; // bits per second
    return Math.ceil((durationSeconds * bitrate) / 8);
  }

  private generateChecksum(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
  }

  private getNextManifestVersion(storeId: string): number {
    const current = this.manifestVersions.get(storeId) || 0;
    return current + 1;
  }

  // =====================================================
  // SYNC STATUS & MANAGEMENT
  // =====================================================

  async getSyncStatus(storeId: string): Promise<SyncStatusDto> {
    let storeSync = this.storeSyncs.get(storeId);
    
    if (!storeSync) {
      storeSync = {
        storeId,
        status: SyncStatus.PENDING,
        lastSyncAt: null,
        manifestVersion: this.manifestVersions.get(storeId) || 0,
        localVersion: 0,
        config: { ...this.defaultConfig },
        pendingCommands: [],
        lastHeartbeat: null,
      };
      this.storeSyncs.set(storeId, storeSync);
    }

    const queue = this.syncQueue.get(storeId) || [];
    const pendingItems = queue.filter(q => q.status !== SyncStatus.COMPLETED);
    const bytesDownloaded = queue.reduce((sum, q) => sum + q.bytesDownloaded, 0);
    const totalBytes = queue.reduce((sum, q) => sum + q.totalBytes, 0);

    return {
      storeId,
      status: storeSync.status,
      lastSyncAt: storeSync.lastSyncAt?.toISOString() || null,
      nextSyncAt: this.calculateNextSyncTime(storeSync),
      manifestVersion: storeSync.manifestVersion,
      localVersion: storeSync.localVersion,
      pendingItems: pendingItems.length,
      progress: totalBytes > 0 ? Math.round((bytesDownloaded / totalBytes) * 100) : 0,
      bytesDownloaded,
      totalBytes,
      downloadSpeed: 0, // Would be calculated from recent progress
      estimatedTimeRemaining: this.estimateTimeRemaining(totalBytes - bytesDownloaded),
      isOfflineMode: !storeSync.lastHeartbeat || 
        (Date.now() - storeSync.lastHeartbeat.getTime()) > 60000, // 1 min
      error: null,
    };
  }

  async requestSync(dto: RequestSyncDto): Promise<SyncManifestDto> {
    const { storeId, forceFullSync, priority, itemTypes } = dto;
    
    this.logger.log(`Sync requested for store: ${storeId} (force: ${forceFullSync})`);

    // Generate new manifest
    const manifest = await this.generateManifest(storeId);

    // Filter by item types if specified
    if (itemTypes?.length) {
      manifest.items = manifest.items.filter(item => itemTypes.includes(item.type));
      manifest.totalSize = manifest.items.reduce((sum, item) => sum + item.size, 0);
    }

    // Update store sync state
    let storeSync = this.storeSyncs.get(storeId);
    if (!storeSync) {
      storeSync = {
        storeId,
        status: SyncStatus.PENDING,
        lastSyncAt: null,
        manifestVersion: manifest.version,
        localVersion: 0,
        config: { ...this.defaultConfig },
        pendingCommands: [],
        lastHeartbeat: null,
      };
    }

    storeSync.manifestVersion = manifest.version;
    storeSync.status = SyncStatus.DOWNLOADING;
    this.storeSyncs.set(storeId, storeSync);

    // Create sync queue items
    const queueItems: SyncQueueItem[] = manifest.items.map(item => ({
      itemId: item.id,
      storeId,
      type: item.type,
      priority: priority || item.priority,
      status: SyncStatus.PENDING,
      bytesDownloaded: 0,
      totalBytes: item.size,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    this.syncQueue.set(storeId, queueItems);

    return manifest;
  }

  async updateSyncProgress(
    storeId: string,
    itemId: string,
    status: SyncStatus,
    bytesDownloaded?: number,
    error?: string,
  ): Promise<void> {
    const queue = this.syncQueue.get(storeId);
    if (!queue) return;

    const item = queue.find(q => q.itemId === itemId);
    if (item) {
      item.status = status;
      if (bytesDownloaded !== undefined) {
        item.bytesDownloaded = bytesDownloaded;
      }
      item.error = error || null;
      item.updatedAt = new Date();
    }

    // Check if all items completed
    const allCompleted = queue.every(q => q.status === SyncStatus.COMPLETED);
    if (allCompleted) {
      const storeSync = this.storeSyncs.get(storeId);
      if (storeSync) {
        storeSync.status = SyncStatus.COMPLETED;
        storeSync.lastSyncAt = new Date();
        storeSync.localVersion = storeSync.manifestVersion;
      }
      this.logger.log(`Sync completed for store: ${storeId}`);
    }
  }

  // =====================================================
  // HEARTBEAT
  // =====================================================

  async processHeartbeat(dto: HeartbeatDto): Promise<HeartbeatResponseDto> {
    const { storeId } = dto;

    // Update store state
    let storeSync = this.storeSyncs.get(storeId);
    if (!storeSync) {
      storeSync = {
        storeId,
        status: SyncStatus.PENDING,
        lastSyncAt: null,
        manifestVersion: 0,
        localVersion: dto.localManifestVersion,
        config: { ...this.defaultConfig },
        pendingCommands: [],
        lastHeartbeat: new Date(),
      };
      this.storeSyncs.set(storeId, storeSync);
    }

    storeSync.lastHeartbeat = new Date();
    storeSync.localVersion = dto.localManifestVersion;

    // Update player state in database
    await this.prisma.playerState.upsert({
      where: { storeId },
      update: {
        isPlaying: dto.isPlaying,
        currentTrackId: dto.currentTrackId || null,
        currentTime: dto.playbackPosition || 0,
        volume: dto.volume,
        updatedAt: new Date(),
      },
      create: {
        storeId,
        isPlaying: dto.isPlaying,
        currentTrackId: dto.currentTrackId || null,
        currentTime: dto.playbackPosition || 0,
        volume: dto.volume,
      },
    });

    // Update store status
    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        status: dto.networkStatus === 'offline' ? 'WARNING' : 'ONLINE',
        lastSeenAt: new Date(),
      },
    });

    // Check if sync needed
    const currentManifestVersion = this.manifestVersions.get(storeId) || 0;
    const syncNeeded = dto.localManifestVersion < currentManifestVersion;

    // Get pending commands
    const commands = [...storeSync.pendingCommands];
    storeSync.pendingCommands = []; // Clear after sending

    return {
      serverTime: new Date().toISOString(),
      commands,
      syncNeeded,
      newManifestVersion: syncNeeded ? currentManifestVersion : null,
      updateAvailable: false, // Would check for player updates
      updateUrl: null,
    };
  }

  // =====================================================
  // COMMANDS
  // =====================================================

  async sendCommand(storeId: string, command: SyncCommandDto): Promise<void> {
    let storeSync = this.storeSyncs.get(storeId);
    if (!storeSync) {
      storeSync = {
        storeId,
        status: SyncStatus.PENDING,
        lastSyncAt: null,
        manifestVersion: 0,
        localVersion: 0,
        config: { ...this.defaultConfig },
        pendingCommands: [],
        lastHeartbeat: null,
      };
      this.storeSyncs.set(storeId, storeSync);
    }

    storeSync.pendingCommands.push(command);
    this.logger.log(`Command queued for store ${storeId}: ${command.type}`);
  }

  async triggerSync(storeId: string): Promise<void> {
    await this.sendCommand(storeId, {
      type: 'SYNC',
      payload: { force: true },
      priority: 10,
    });
  }

  async triggerReload(storeId: string): Promise<void> {
    await this.sendCommand(storeId, {
      type: 'RELOAD',
      payload: {},
      priority: 5,
    });
  }

  // =====================================================
  // CONFIG
  // =====================================================

  async getSyncConfig(storeId: string): Promise<SyncConfigDto> {
    const storeSync = this.storeSyncs.get(storeId);
    return storeSync?.config || { ...this.defaultConfig };
  }

  async updateSyncConfig(storeId: string, config: Partial<SyncConfigDto>): Promise<SyncConfigDto> {
    let storeSync = this.storeSyncs.get(storeId);
    if (!storeSync) {
      storeSync = {
        storeId,
        status: SyncStatus.PENDING,
        lastSyncAt: null,
        manifestVersion: 0,
        localVersion: 0,
        config: { ...this.defaultConfig },
        pendingCommands: [],
        lastHeartbeat: null,
      };
    }

    storeSync.config = { ...storeSync.config, ...config };
    this.storeSyncs.set(storeId, storeSync);

    return storeSync.config;
  }

  // =====================================================
  // OFFLINE STORAGE
  // =====================================================

  async getStorageInfo(storeId: string): Promise<OfflineStorageInfoDto> {
    const queue = this.syncQueue.get(storeId) || [];
    const config = await this.getSyncConfig(storeId);

    const totalStorage = (config.maxStorageMB || 5000) * 1024 * 1024;
    const usedStorage = queue
      .filter(q => q.status === SyncStatus.COMPLETED)
      .reduce((sum, q) => sum + q.totalBytes, 0);

    const breakdown = {
      tracks: queue.filter(q => q.type === SyncItemType.TRACK && q.status === SyncStatus.COMPLETED)
        .reduce((sum, q) => sum + q.totalBytes, 0),
      announcements: queue.filter(q => q.type === SyncItemType.ANNOUNCEMENT && q.status === SyncStatus.COMPLETED)
        .reduce((sum, q) => sum + q.totalBytes, 0),
      playlists: queue.filter(q => q.type === SyncItemType.PLAYLIST && q.status === SyncStatus.COMPLETED)
        .reduce((sum, q) => sum + q.totalBytes, 0),
      configs: queue.filter(q => q.type === SyncItemType.CONFIG && q.status === SyncStatus.COMPLETED)
        .reduce((sum, q) => sum + q.totalBytes, 0),
      other: 0,
    };

    return {
      storeId,
      totalStorage,
      usedStorage,
      availableStorage: totalStorage - usedStorage,
      usagePercent: Math.round((usedStorage / totalStorage) * 100),
      cachedTracks: queue.filter(q => q.type === SyncItemType.TRACK && q.status === SyncStatus.COMPLETED).length,
      cachedAnnouncements: queue.filter(q => q.type === SyncItemType.ANNOUNCEMENT && q.status === SyncStatus.COMPLETED).length,
      breakdown,
      oldestCacheDate: null, // Would track actual dates
      newestCacheDate: null,
    };
  }

  async clearCache(storeId: string, itemTypes?: SyncItemType[]): Promise<void> {
    const queue = this.syncQueue.get(storeId);
    if (!queue) return;

    if (itemTypes?.length) {
      // Clear specific types
      this.syncQueue.set(
        storeId,
        queue.filter(q => !itemTypes.includes(q.type)),
      );
    } else {
      // Clear all
      this.syncQueue.delete(storeId);
    }

    this.logger.log(`Cache cleared for store: ${storeId}`);
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private calculateNextSyncTime(storeSync: StoreSync): string | null {
    if (!storeSync.config.autoSync) return null;

    const now = new Date();
    const intervalMs = (storeSync.config.syncIntervalMinutes || 60) * 60 * 1000;
    
    // If never synced, sync now
    if (!storeSync.lastSyncAt) {
      return now.toISOString();
    }

    // Calculate next sync based on interval
    const nextSync = new Date(storeSync.lastSyncAt.getTime() + intervalMs);

    // Adjust to preferred hours if configured
    if (storeSync.config.preferredSyncHours?.length) {
      const hour = nextSync.getHours();
      if (!storeSync.config.preferredSyncHours.includes(hour)) {
        // Find next preferred hour
        const sortedHours = [...storeSync.config.preferredSyncHours].sort((a, b) => a - b);
        const nextHour = sortedHours.find(h => h > hour) || sortedHours[0];
        
        nextSync.setHours(nextHour, 0, 0, 0);
        if (nextHour <= hour) {
          nextSync.setDate(nextSync.getDate() + 1);
        }
      }
    }

    return nextSync.toISOString();
  }

  private estimateTimeRemaining(bytesRemaining: number): number {
    // Assume 2 Mbps download speed
    const bytesPerSecond = 2 * 1024 * 1024 / 8;
    return Math.ceil(bytesRemaining / bytesPerSecond);
  }
}
