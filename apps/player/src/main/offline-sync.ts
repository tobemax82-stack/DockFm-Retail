// =====================================================
// DOCKFM RETAIL - OFFLINE SYNC MANAGER
// Electron Main Process Sync Service
// =====================================================

import { app, ipcMain, net } from 'electron';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync, unlinkSync, statSync, readdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import Store from 'electron-store';
import * as crypto from 'crypto';

// =====================================================
// TYPES
// =====================================================

interface SyncItem {
  id: string;
  type: 'TRACK' | 'ANNOUNCEMENT' | 'PLAYLIST' | 'SCHEDULE' | 'CONFIG';
  name: string;
  url: string;
  size: number;
  checksum: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  lastModified?: string;
  metadata?: any;
}

interface SyncManifest {
  storeId: string;
  version: number;
  generatedAt: string;
  items: SyncItem[];
  totalSize: number;
  estimatedTime: number;
}

interface DownloadProgress {
  itemId: string;
  bytesDownloaded: number;
  totalBytes: number;
  status: 'PENDING' | 'DOWNLOADING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  localManifestVersion: number;
  pendingDownloads: number;
  totalProgress: number;
}

// =====================================================
// SYNC MANAGER CLASS
// =====================================================

export class OfflineSyncManager {
  private store: Store;
  private apiBaseUrl: string;
  private storeId: string | null = null;
  private cacheDir: string;
  private manifestPath: string;
  private downloadQueue: SyncItem[] = [];
  private isDownloading = false;
  private currentDownload: DownloadProgress | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  // Event callbacks
  private onSyncStateChange?: (state: SyncState) => void;
  private onDownloadProgress?: (progress: DownloadProgress) => void;

  constructor(store: Store, apiBaseUrl: string = 'http://localhost:5001/api/v1') {
    this.store = store;
    this.apiBaseUrl = apiBaseUrl;
    
    // Set up cache directory
    this.cacheDir = join(app.getPath('userData'), 'cache', 'audio');
    this.manifestPath = join(app.getPath('userData'), 'sync-manifest.json');
    
    // Ensure cache directory exists
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }

    this.setupIpcHandlers();
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  async initialize(storeId: string): Promise<void> {
    this.storeId = storeId;
    
    // Load local manifest if exists
    await this.loadLocalManifest();
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Start periodic sync check
    this.startSyncCheck();
    
    console.log(`[Sync] Initialized for store: ${storeId}`);
  }

  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  // =====================================================
  // IPC HANDLERS
  // =====================================================

  private setupIpcHandlers(): void {
    // Request sync
    ipcMain.handle('sync:request', async () => {
      return this.requestSync();
    });

    // Get sync status
    ipcMain.handle('sync:status', () => {
      return this.getSyncState();
    });

    // Get cached file path
    ipcMain.handle('sync:getCachedPath', (_, itemId: string) => {
      return this.getCachedFilePath(itemId);
    });

    // Check if file is cached
    ipcMain.handle('sync:isCached', (_, itemId: string) => {
      return this.isFileCached(itemId);
    });

    // Get storage info
    ipcMain.handle('sync:storageInfo', () => {
      return this.getStorageInfo();
    });

    // Clear cache
    ipcMain.handle('sync:clearCache', async () => {
      return this.clearCache();
    });

    // Get local manifest
    ipcMain.handle('sync:manifest', async () => {
      return this.loadLocalManifest();
    });
  }

  // =====================================================
  // HEARTBEAT
  // =====================================================

  private startHeartbeat(): void {
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000);

    // Send initial heartbeat
    this.sendHeartbeat();
  }

  private async sendHeartbeat(): Promise<void> {
    if (!this.storeId) return;

    try {
      const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/sync/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: this.storeId,
          playerVersion: app.getVersion(),
          osInfo: process.platform,
          isPlaying: this.store.get('isPlaying', false),
          currentTrackId: this.store.get('currentTrackId'),
          playbackPosition: this.store.get('playbackPosition', 0),
          volume: this.store.get('volume', 70),
          isOfflineMode: !this.isOnline(),
          storageUsedMB: Math.round(this.getCacheSize() / (1024 * 1024)),
          networkStatus: this.isOnline() ? 'online' : 'offline',
          localManifestVersion: this.store.get('manifestVersion', 0),
        }),
      });

      const data = await response.json();

      // Process server commands
      if (data.commands?.length) {
        for (const command of data.commands) {
          this.processCommand(command);
        }
      }

      // Check if sync needed
      if (data.syncNeeded) {
        this.requestSync();
      }

    } catch (error) {
      console.log('[Sync] Heartbeat failed, running in offline mode');
    }
  }

  private processCommand(command: { type: string; payload: any }): void {
    console.log(`[Sync] Processing command: ${command.type}`);
    
    // Forward command to renderer process via IPC
    const windows = require('electron').BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      windows[0].webContents.send('sync:command', command);
    }
  }

  // =====================================================
  // SYNC LOGIC
  // =====================================================

  private startSyncCheck(): void {
    // Check for sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.checkAndSync();
    }, 5 * 60 * 1000);
  }

  private async checkAndSync(): Promise<void> {
    if (!this.storeId || !this.isOnline() || this.isDownloading) return;

    // Check sync schedule (prefer night hours)
    const hour = new Date().getHours();
    const preferNight = this.store.get('preferNightSync', true);
    const nightHours = [2, 3, 4, 5];
    
    if (preferNight && !nightHours.includes(hour)) {
      // Only sync during day if critical items pending
      const hasCritical = this.downloadQueue.some(item => item.priority === 'CRITICAL');
      if (!hasCritical) return;
    }

    await this.requestSync();
  }

  async requestSync(force = false): Promise<SyncManifest | null> {
    if (!this.storeId) return null;

    try {
      console.log('[Sync] Requesting manifest...');
      
      const response = await this.fetchWithTimeout(
        `${this.apiBaseUrl}/sync/${this.storeId}/manifest`
      );
      
      const manifest: SyncManifest = await response.json();
      
      // Compare with local version
      const localVersion = this.store.get('manifestVersion', 0);
      
      if (manifest.version <= localVersion && !force) {
        console.log('[Sync] Already up to date');
        return manifest;
      }

      // Save manifest
      await this.saveManifest(manifest);

      // Queue downloads
      await this.queueDownloads(manifest.items);

      // Start downloading
      this.processDownloadQueue();

      return manifest;

    } catch (error) {
      console.error('[Sync] Failed to fetch manifest:', error);
      return null;
    }
  }

  private async queueDownloads(items: SyncItem[]): Promise<void> {
    // Filter out already cached items
    const toDownload: SyncItem[] = [];

    for (const item of items) {
      if (!this.isFileCached(item.id) || item.priority === 'CRITICAL') {
        toDownload.push(item);
      }
    }

    // Sort by priority
    toDownload.sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    this.downloadQueue = toDownload;
    console.log(`[Sync] Queued ${toDownload.length} items for download`);
  }

  private async processDownloadQueue(): Promise<void> {
    if (this.isDownloading || this.downloadQueue.length === 0) return;

    this.isDownloading = true;

    while (this.downloadQueue.length > 0 && this.isOnline()) {
      const item = this.downloadQueue.shift()!;
      
      try {
        await this.downloadItem(item);
      } catch (error) {
        console.error(`[Sync] Failed to download ${item.name}:`, error);
        
        // Re-queue with lower priority on failure
        if (item.priority !== 'LOW') {
          this.downloadQueue.push({ ...item, priority: 'LOW' });
        }
      }
    }

    this.isDownloading = false;
    
    // Update state
    if (this.downloadQueue.length === 0) {
      console.log('[Sync] All downloads completed');
    }
  }

  private async downloadItem(item: SyncItem): Promise<void> {
    return new Promise((resolve, reject) => {
      const filePath = this.getCacheFilePath(item.id, item.type);
      const fileStream = createWriteStream(filePath);
      
      let downloadedBytes = 0;
      
      this.currentDownload = {
        itemId: item.id,
        bytesDownloaded: 0,
        totalBytes: item.size,
        status: 'DOWNLOADING',
      };

      const request = net.request(item.url);
      
      request.on('response', (response) => {
        if (response.statusCode !== 200) {
          fileStream.close();
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        response.on('data', (chunk) => {
          fileStream.write(chunk);
          downloadedBytes += chunk.length;
          
          this.currentDownload = {
            itemId: item.id,
            bytesDownloaded: downloadedBytes,
            totalBytes: item.size,
            status: 'DOWNLOADING',
          };

          this.onDownloadProgress?.(this.currentDownload);
        });

        response.on('end', () => {
          fileStream.close();
          
          this.currentDownload = {
            itemId: item.id,
            bytesDownloaded: item.size,
            totalBytes: item.size,
            status: 'COMPLETED',
          };

          this.onDownloadProgress?.(this.currentDownload);
          console.log(`[Sync] Downloaded: ${item.name}`);
          resolve();
        });

        response.on('error', (error) => {
          fileStream.close();
          reject(error);
        });
      });

      request.on('error', (error) => {
        fileStream.close();
        reject(error);
      });

      request.end();
    });
  }

  // =====================================================
  // CACHE MANAGEMENT
  // =====================================================

  private getCacheFilePath(itemId: string, type: string): string {
    const ext = type === 'CONFIG' || type === 'SCHEDULE' ? '.json' : '.mp3';
    return join(this.cacheDir, `${itemId}${ext}`);
  }

  getCachedFilePath(itemId: string): string | null {
    // Check for both mp3 and json extensions
    const mp3Path = join(this.cacheDir, `${itemId}.mp3`);
    const jsonPath = join(this.cacheDir, `${itemId}.json`);
    
    if (existsSync(mp3Path)) return mp3Path;
    if (existsSync(jsonPath)) return jsonPath;
    
    return null;
  }

  isFileCached(itemId: string): boolean {
    return this.getCachedFilePath(itemId) !== null;
  }

  getCacheSize(): number {
    let totalSize = 0;
    
    try {
      const files = readdirSync(this.cacheDir);
      for (const file of files) {
        const filePath = join(this.cacheDir, file);
        const stat = statSync(filePath);
        totalSize += stat.size;
      }
    } catch (error) {
      console.error('[Sync] Error calculating cache size:', error);
    }
    
    return totalSize;
  }

  getStorageInfo(): {
    totalStorage: number;
    usedStorage: number;
    availableStorage: number;
    cachedItems: number;
  } {
    const maxStorage = (this.store.get('maxStorageMB', 5000) as number) * 1024 * 1024;
    const usedStorage = this.getCacheSize();
    
    let cachedItems = 0;
    try {
      cachedItems = readdirSync(this.cacheDir).length;
    } catch {}

    return {
      totalStorage: maxStorage,
      usedStorage,
      availableStorage: maxStorage - usedStorage,
      cachedItems,
    };
  }

  async clearCache(): Promise<void> {
    try {
      const files = readdirSync(this.cacheDir);
      for (const file of files) {
        unlinkSync(join(this.cacheDir, file));
      }
      console.log('[Sync] Cache cleared');
    } catch (error) {
      console.error('[Sync] Error clearing cache:', error);
    }
  }

  // =====================================================
  // MANIFEST PERSISTENCE
  // =====================================================

  private async saveManifest(manifest: SyncManifest): Promise<void> {
    try {
      await writeFile(this.manifestPath, JSON.stringify(manifest, null, 2));
      this.store.set('manifestVersion', manifest.version);
      console.log(`[Sync] Saved manifest version ${manifest.version}`);
    } catch (error) {
      console.error('[Sync] Error saving manifest:', error);
    }
  }

  async loadLocalManifest(): Promise<SyncManifest | null> {
    try {
      if (!existsSync(this.manifestPath)) return null;
      
      const data = await readFile(this.manifestPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('[Sync] Error loading manifest:', error);
      return null;
    }
  }

  // =====================================================
  // UTILITY
  // =====================================================

  private isOnline(): boolean {
    return net.isOnline();
  }

  private async fetchWithTimeout(url: string, options: any = {}, timeout = 10000): Promise<any> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  getSyncState(): SyncState {
    return {
      isOnline: this.isOnline(),
      isSyncing: this.isDownloading,
      lastSyncAt: this.store.get('lastSyncAt') as string | null,
      localManifestVersion: this.store.get('manifestVersion', 0) as number,
      pendingDownloads: this.downloadQueue.length,
      totalProgress: this.calculateTotalProgress(),
    };
  }

  private calculateTotalProgress(): number {
    if (!this.currentDownload || this.downloadQueue.length === 0) return 100;
    
    const currentProgress = (this.currentDownload.bytesDownloaded / this.currentDownload.totalBytes) * 100;
    const remaining = this.downloadQueue.length;
    
    return Math.round((100 - remaining * 100 / (remaining + 1)) + currentProgress / (remaining + 1));
  }

  // Event setters
  setOnSyncStateChange(callback: (state: SyncState) => void): void {
    this.onSyncStateChange = callback;
  }

  setOnDownloadProgress(callback: (progress: DownloadProgress) => void): void {
    this.onDownloadProgress = callback;
  }
}

// Singleton instance
let syncManager: OfflineSyncManager | null = null;

export function createSyncManager(store: Store, apiBaseUrl?: string): OfflineSyncManager {
  if (!syncManager) {
    syncManager = new OfflineSyncManager(store, apiBaseUrl);
  }
  return syncManager;
}

export function getSyncManager(): OfflineSyncManager | null {
  return syncManager;
}
