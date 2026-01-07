// =====================================================
// DOCKFM RETAIL - OFFLINE SYNC HOOK
// React hook for offline sync management
// =====================================================

import { useState, useEffect, useCallback } from 'react';

// =====================================================
// TYPES
// =====================================================

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  localManifestVersion: number;
  pendingDownloads: number;
  totalProgress: number;
}

export interface StorageInfo {
  totalStorage: number;
  usedStorage: number;
  availableStorage: number;
  cachedItems: number;
}

export interface SyncCommand {
  type: 'SYNC' | 'PLAY' | 'PAUSE' | 'STOP' | 'VOLUME' | 'RELOAD' | 'UPDATE' | 'RESTART';
  payload: any;
  priority: number;
}

// =====================================================
// HOOK
// =====================================================

export function useOfflineSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: true,
    isSyncing: false,
    lastSyncAt: null,
    localManifestVersion: 0,
    pendingDownloads: 0,
    totalProgress: 100,
  });
  
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [lastCommand, setLastCommand] = useState<SyncCommand | null>(null);

  // Refresh sync state
  const refreshSyncState = useCallback(async () => {
    if (window.electron?.invoke) {
      const state = await window.electron.invoke('sync:status');
      if (state) {
        setSyncState(state);
      }
    }
  }, []);

  // Request sync
  const requestSync = useCallback(async () => {
    if (window.electron?.invoke) {
      return window.electron.invoke('sync:request');
    }
    return null;
  }, []);

  // Get cached file path
  const getCachedPath = useCallback(async (itemId: string): Promise<string | null> => {
    if (window.electron?.invoke) {
      return window.electron.invoke('sync:getCachedPath', itemId);
    }
    return null;
  }, []);

  // Check if file is cached
  const isCached = useCallback(async (itemId: string): Promise<boolean> => {
    if (window.electron?.invoke) {
      return window.electron.invoke('sync:isCached', itemId);
    }
    return false;
  }, []);

  // Get storage info
  const refreshStorageInfo = useCallback(async () => {
    if (window.electron?.invoke) {
      const info = await window.electron.invoke('sync:storageInfo');
      if (info) {
        setStorageInfo(info);
      }
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (window.electron?.invoke) {
      await window.electron.invoke('sync:clearCache');
      await refreshStorageInfo();
    }
  }, [refreshStorageInfo]);

  // Get local manifest
  const getManifest = useCallback(async () => {
    if (window.electron?.invoke) {
      return window.electron.invoke('sync:manifest');
    }
    return null;
  }, []);

  // Setup effect
  useEffect(() => {
    // Initial refresh
    refreshSyncState();
    refreshStorageInfo();

    // Poll sync state every 5 seconds
    const interval = setInterval(refreshSyncState, 5000);

    // Listen for server commands
    const handleCommand = (_event: any, command: SyncCommand) => {
      console.log('[Sync] Received command:', command);
      setLastCommand(command);
      
      // Handle common commands
      switch (command.type) {
        case 'SYNC':
          requestSync();
          break;
        case 'RELOAD':
          window.location.reload();
          break;
        // Other commands should be handled by the parent component
      }
    };

    if (window.electron?.on) {
      window.electron.on('sync:command', handleCommand);
    }

    return () => {
      clearInterval(interval);
      if (window.electron?.off) {
        window.electron.off('sync:command', handleCommand);
      }
    };
  }, [refreshSyncState, refreshStorageInfo, requestSync]);

  // Format bytes for display
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return {
    // State
    syncState,
    storageInfo,
    lastCommand,
    
    // Actions
    requestSync,
    getCachedPath,
    isCached,
    clearCache,
    getManifest,
    refreshSyncState,
    refreshStorageInfo,
    
    // Helpers
    formatBytes,
    
    // Computed
    isOfflineMode: !syncState.isOnline,
    hasOfflineContent: (storageInfo?.cachedItems || 0) > 0,
  };
}

// =====================================================
// OFFLINE-AWARE AUDIO PLAYER HOOK
// =====================================================

interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration: number;
}

export function useOfflineAudioPlayer() {
  const { getCachedPath, isCached, syncState } = useOfflineSync();
  const [audioElement] = useState(() => new Audio());
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get best available URL for track
  const getTrackUrl = useCallback(async (track: AudioTrack): Promise<string> => {
    // Check if we have offline version
    const cached = await isCached(track.id);
    
    if (cached) {
      const cachedPath = await getCachedPath(track.id);
      if (cachedPath) {
        // Use file:// protocol for local files
        return `file://${cachedPath}`;
      }
    }

    // If online, use remote URL
    if (syncState.isOnline) {
      return track.url;
    }

    // Offline and not cached - error
    throw new Error('Track non disponibile offline');
  }, [getCachedPath, isCached, syncState.isOnline]);

  // Play track
  const play = useCallback(async (track?: AudioTrack) => {
    setError(null);
    
    if (track) {
      try {
        setIsLoading(true);
        const url = await getTrackUrl(track);
        
        audioElement.src = url;
        audioElement.load();
        
        setCurrentTrack(track);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore di riproduzione');
        setIsLoading(false);
        return;
      }
    }

    try {
      await audioElement.play();
      setIsPlaying(true);
    } catch (err) {
      setError('Impossibile riprodurre l\'audio');
    }
    setIsLoading(false);
  }, [audioElement, getTrackUrl]);

  // Pause
  const pause = useCallback(() => {
    audioElement.pause();
    setIsPlaying(false);
  }, [audioElement]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // Seek
  const seek = useCallback((time: number) => {
    audioElement.currentTime = time;
    setCurrentTime(time);
  }, [audioElement]);

  // Set volume
  const changeVolume = useCallback((newVolume: number) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    audioElement.volume = vol;
    setVolume(vol);
  }, [audioElement]);

  // Setup audio events
  useEffect(() => {
    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audioElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setError('Errore durante la riproduzione');
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('durationchange', handleDurationChange);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);
    audioElement.addEventListener('canplay', handleCanPlay);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('durationchange', handleDurationChange);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
      audioElement.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioElement]);

  return {
    // State
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    
    // Actions
    play,
    pause,
    togglePlay,
    seek,
    setVolume: changeVolume,
    
    // Computed
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
    isOfflineMode: !syncState.isOnline,
  };
}

// =====================================================
// ELECTRON WINDOW TYPE AUGMENTATION
// =====================================================

declare global {
  interface Window {
    electron?: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, callback: (...args: any[]) => void) => void;
      off: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
}
