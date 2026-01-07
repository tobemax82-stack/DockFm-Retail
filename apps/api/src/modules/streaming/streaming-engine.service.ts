// =====================================================
// DOCKFM RETAIL - AUDIO STREAMING ENGINE
// Real-time audio streaming with processing
// =====================================================

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

// =====================================================
// INTERFACES
// =====================================================

export interface AudioSegment {
  id: string;
  trackId: string;
  url: string;
  startTime: number;
  endTime: number;
  index: number;
}

export interface StreamSession {
  sessionId: string;
  storeId: string;
  playlistId: string | null;
  currentTrackId: string | null;
  currentTrackIndex: number;
  position: number; // seconds
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  config: StreamConfig;
  queue: QueueItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueItem {
  trackId: string;
  title: string;
  artist?: string;
  duration: number;
  url: string;
  scheduledTime?: Date;
  isAnnouncement: boolean;
  priority: number;
}

export interface StreamConfig {
  // Audio quality
  format: 'mp3' | 'aac' | 'opus';
  bitrate: number;
  sampleRate: number;
  
  // Loudness normalization (EBU R128)
  targetLufs: number;
  loudnessRange: number;
  truePeak: number;
  
  // Crossfade
  crossfadeEnabled: boolean;
  crossfadeDuration: number; // ms
  crossfadeCurve: 'linear' | 'equal-power' | 'logarithmic';
  
  // Ducking (for announcements)
  duckingEnabled: boolean;
  duckingLevel: number; // 0-1
  duckingAttack: number; // ms
  duckingRelease: number; // ms
  
  // Buffer
  bufferSize: number; // segments
  preloadNext: boolean;
}

export interface PlaybackEvent {
  type: 'play' | 'pause' | 'stop' | 'track-change' | 'announcement' | 'error' | 'buffer';
  sessionId: string;
  storeId: string;
  data: any;
  timestamp: Date;
}

// =====================================================
// STREAMING ENGINE SERVICE
// =====================================================

@Injectable()
export class StreamingEngineService {
  private readonly logger = new Logger(StreamingEngineService.name);
  private sessions: Map<string, StreamSession> = new Map();
  
  private readonly defaultConfig: StreamConfig = {
    format: 'aac',
    bitrate: 128,
    sampleRate: 44100,
    targetLufs: -14,
    loudnessRange: 7,
    truePeak: -1,
    crossfadeEnabled: true,
    crossfadeDuration: 3000,
    crossfadeCurve: 'equal-power',
    duckingEnabled: true,
    duckingLevel: 0.3,
    duckingAttack: 500,
    duckingRelease: 800,
    bufferSize: 3,
    preloadNext: true,
  };

  constructor(private eventEmitter: EventEmitter2) {}

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  async createSession(
    storeId: string,
    config?: Partial<StreamConfig>,
  ): Promise<StreamSession> {
    const sessionId = `stream_${storeId}_${Date.now()}`;
    
    const session: StreamSession = {
      sessionId,
      storeId,
      playlistId: null,
      currentTrackId: null,
      currentTrackIndex: -1,
      position: 0,
      isPlaying: false,
      volume: 70,
      isMuted: false,
      config: { ...this.defaultConfig, ...config },
      queue: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    this.logger.log(`Created streaming session: ${sessionId} for store: ${storeId}`);
    
    return session;
  }

  async getSession(sessionId: string): Promise<StreamSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getSessionByStore(storeId: string): Promise<StreamSession | null> {
    for (const session of this.sessions.values()) {
      if (session.storeId === storeId) {
        return session;
      }
    }
    return null;
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.emitEvent({
        type: 'stop',
        sessionId,
        storeId: session.storeId,
        data: { reason: 'session_destroyed' },
        timestamp: new Date(),
      });
      this.sessions.delete(sessionId);
      this.logger.log(`Destroyed streaming session: ${sessionId}`);
    }
  }

  // =====================================================
  // PLAYBACK CONTROL
  // =====================================================

  async play(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.isPlaying = true;
    session.updatedAt = new Date();

    this.emitEvent({
      type: 'play',
      sessionId,
      storeId: session.storeId,
      data: {
        trackId: session.currentTrackId,
        position: session.position,
      },
      timestamp: new Date(),
    });
  }

  async pause(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.isPlaying = false;
    session.updatedAt = new Date();

    this.emitEvent({
      type: 'pause',
      sessionId,
      storeId: session.storeId,
      data: {
        trackId: session.currentTrackId,
        position: session.position,
      },
      timestamp: new Date(),
    });
  }

  async stop(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.isPlaying = false;
    session.position = 0;
    session.updatedAt = new Date();

    this.emitEvent({
      type: 'stop',
      sessionId,
      storeId: session.storeId,
      data: {},
      timestamp: new Date(),
    });
  }

  async seek(sessionId: string, position: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.position = position;
    session.updatedAt = new Date();
  }

  async setVolume(sessionId: string, volume: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.volume = Math.max(0, Math.min(100, volume));
    session.updatedAt = new Date();
  }

  async setMuted(sessionId: string, muted: boolean): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.isMuted = muted;
    session.updatedAt = new Date();
  }

  // =====================================================
  // QUEUE MANAGEMENT
  // =====================================================

  async loadPlaylist(
    sessionId: string,
    playlistId: string,
    tracks: QueueItem[],
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.playlistId = playlistId;
    session.queue = tracks.map((t, i) => ({
      ...t,
      priority: t.priority || 0,
    }));
    session.currentTrackIndex = -1;
    session.updatedAt = new Date();

    this.logger.log(`Loaded playlist ${playlistId} with ${tracks.length} tracks`);
  }

  async next(sessionId: string): Promise<QueueItem | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.queue.length === 0) return null;

    // Check for priority items (announcements)
    const priorityIndex = session.queue.findIndex(
      (item) => item.isAnnouncement && item.priority > 0,
    );

    if (priorityIndex >= 0) {
      return this.playTrackAtIndex(session, priorityIndex);
    }

    // Normal next track
    const nextIndex = (session.currentTrackIndex + 1) % session.queue.length;
    return this.playTrackAtIndex(session, nextIndex);
  }

  async previous(sessionId: string): Promise<QueueItem | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.queue.length === 0) return null;

    const prevIndex = session.currentTrackIndex <= 0 
      ? session.queue.length - 1 
      : session.currentTrackIndex - 1;
    
    return this.playTrackAtIndex(session, prevIndex);
  }

  async skipTo(sessionId: string, trackIndex: number): Promise<QueueItem | null> {
    const session = this.sessions.get(sessionId);
    if (!session || trackIndex >= session.queue.length) return null;

    return this.playTrackAtIndex(session, trackIndex);
  }

  private async playTrackAtIndex(
    session: StreamSession,
    index: number,
  ): Promise<QueueItem> {
    const track = session.queue[index];
    
    session.currentTrackIndex = index;
    session.currentTrackId = track.trackId;
    session.position = 0;
    session.updatedAt = new Date();

    this.emitEvent({
      type: 'track-change',
      sessionId: session.sessionId,
      storeId: session.storeId,
      data: {
        track,
        index,
        crossfade: session.config.crossfadeEnabled,
      },
      timestamp: new Date(),
    });

    return track;
  }

  // =====================================================
  // ANNOUNCEMENT INJECTION
  // =====================================================

  async injectAnnouncement(
    sessionId: string,
    announcement: QueueItem,
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    this.logger.log(`Injecting announcement: ${announcement.title}`);

    // Apply ducking to current music
    if (session.config.duckingEnabled && session.isPlaying) {
      this.emitEvent({
        type: 'announcement',
        sessionId: session.sessionId,
        storeId: session.storeId,
        data: {
          action: 'duck-start',
          duckingLevel: session.config.duckingLevel,
          attackTime: session.config.duckingAttack,
          announcement,
        },
        timestamp: new Date(),
      });
    }

    // Insert at beginning of queue with high priority
    session.queue.unshift({
      ...announcement,
      isAnnouncement: true,
      priority: 10,
    });
    session.updatedAt = new Date();
  }

  async announcementComplete(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Remove completed announcement from queue
    session.queue = session.queue.filter(
      (item) => !(item.isAnnouncement && item.priority === 10),
    );

    // Release ducking
    if (session.config.duckingEnabled) {
      this.emitEvent({
        type: 'announcement',
        sessionId: session.sessionId,
        storeId: session.storeId,
        data: {
          action: 'duck-release',
          releaseTime: session.config.duckingRelease,
        },
        timestamp: new Date(),
      });
    }
  }

  // =====================================================
  // CROSSFADE CALCULATION
  // =====================================================

  calculateCrossfade(
    currentTrack: { duration: number },
    nextTrack: { duration: number },
    config: StreamConfig,
  ): {
    fadeOutStart: number;
    fadeOutEnd: number;
    fadeInStart: number;
    fadeInEnd: number;
    curve: string;
  } {
    const crossfadeSeconds = config.crossfadeDuration / 1000;
    
    return {
      fadeOutStart: currentTrack.duration - crossfadeSeconds,
      fadeOutEnd: currentTrack.duration,
      fadeInStart: 0,
      fadeInEnd: crossfadeSeconds,
      curve: config.crossfadeCurve,
    };
  }

  // =====================================================
  // LOUDNESS NORMALIZATION (EBU R128)
  // =====================================================

  calculateNormalizationGain(
    measuredLufs: number,
    targetLufs: number = -14,
  ): number {
    // Gain needed to reach target LUFS
    return targetLufs - measuredLufs;
  }

  getLoudnessSpec(): {
    targetLufs: number;
    loudnessRange: number;
    truePeakLimit: number;
  } {
    return {
      targetLufs: this.defaultConfig.targetLufs,
      loudnessRange: this.defaultConfig.loudnessRange,
      truePeakLimit: this.defaultConfig.truePeak,
    };
  }

  // =====================================================
  // BUFFER MANAGEMENT
  // =====================================================

  async getNextSegments(
    sessionId: string,
    count: number = 3,
  ): Promise<QueueItem[]> {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const startIndex = session.currentTrackIndex + 1;
    const segments: QueueItem[] = [];

    for (let i = 0; i < count; i++) {
      const index = (startIndex + i) % session.queue.length;
      if (session.queue[index]) {
        segments.push(session.queue[index]);
      }
    }

    return segments;
  }

  // =====================================================
  // EVENTS
  // =====================================================

  private emitEvent(event: PlaybackEvent): void {
    this.eventEmitter.emit('streaming.event', event);
    this.logger.debug(`Event: ${event.type} for session: ${event.sessionId}`);
  }

  // =====================================================
  // STATUS
  // =====================================================

  async getStatus(sessionId: string): Promise<{
    session: StreamSession | null;
    currentTrack: QueueItem | null;
    nextTracks: QueueItem[];
    progress: number;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        session: null,
        currentTrack: null,
        nextTracks: [],
        progress: 0,
      };
    }

    const currentTrack = session.currentTrackIndex >= 0
      ? session.queue[session.currentTrackIndex]
      : null;

    const progress = currentTrack
      ? (session.position / currentTrack.duration) * 100
      : 0;

    return {
      session,
      currentTrack,
      nextTracks: await this.getNextSegments(sessionId, 3),
      progress,
    };
  }

  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  getActiveSessions(): StreamSession[] {
    return Array.from(this.sessions.values());
  }
}
