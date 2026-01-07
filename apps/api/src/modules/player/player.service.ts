import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoresService } from '../stores/stores.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { PlayerStateDto, PlayerHeartbeatDto } from './dto/player.dto';
import { PlaybackEventType } from '@prisma/client';

@Injectable()
export class PlayerService {
  constructor(
    private prisma: PrismaService,
    private storesService: StoresService,
    private schedulerService: SchedulerService,
    private analyticsService: AnalyticsService,
  ) {}

  /**
   * Ottieni stato completo del player per uno store
   */
  async getPlayerState(storeId: string, deviceId: string): Promise<PlayerStateDto> {
    // Verifica che il dispositivo sia autorizzato
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, deviceId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            plan: true,
            settings: true,
          },
        },
        activePlaylist: {
          include: {
            tracks: {
              orderBy: { order: 'asc' },
            },
          },
        },
        cartwallItems: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
          include: {
            announcement: true,
          },
        },
        scheduleRules: {
          where: { isActive: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
          include: {
            playlist: {
              include: {
                tracks: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!store) {
      throw new UnauthorizedException('Dispositivo non autorizzato');
    }

    // Ottieni la playlist corrente in base alla programmazione
    const scheduledPlaylist = await this.schedulerService.getCurrentPlaylist(storeId);

    return {
      store: {
        id: store.id,
        name: store.name,
        city: store.city,
        timezone: store.timezone,
        currentVolume: store.currentVolume,
      },
      organization: store.organization,
      currentPlaylist: scheduledPlaylist || store.activePlaylist,
      cartwall: store.cartwallItems.map(item => ({
        position: item.position,
        announcement: item.announcement,
      })),
      schedule: store.scheduleRules,
      settings: {
        ...store.organization.settings,
        ...store.settings,
      },
    };
  }

  /**
   * Heartbeat dal player - mantiene lo store online
   */
  async heartbeat(dto: PlayerHeartbeatDto) {
    const store = await this.prisma.store.findFirst({
      where: { id: dto.storeId, deviceId: dto.deviceId },
    });

    if (!store) {
      throw new UnauthorizedException('Dispositivo non autorizzato');
    }

    // Aggiorna stato online e last seen
    await this.prisma.store.update({
      where: { id: dto.storeId },
      data: {
        isOnline: true,
        lastSeen: new Date(),
        currentVolume: dto.volume,
        deviceInfo: dto.deviceInfo,
      },
    });

    // Se sta riproducendo qualcosa, registra il playback
    if (dto.currentTrackId) {
      await this.analyticsService.logPlayback({
        storeId: dto.storeId,
        trackId: dto.currentTrackId,
        eventType: PlaybackEventType.TRACK_PLAYING,
        metadata: {
          position: dto.trackPosition,
          volume: dto.volume,
        },
      });
    }

    return { status: 'ok', serverTime: new Date().toISOString() };
  }

  /**
   * Player va offline
   */
  async goOffline(storeId: string, deviceId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, deviceId },
    });

    if (!store) {
      throw new UnauthorizedException('Dispositivo non autorizzato');
    }

    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        isOnline: false,
        lastSeen: new Date(),
      },
    });

    return { status: 'offline' };
  }

  /**
   * Registra inizio riproduzione traccia
   */
  async trackStarted(storeId: string, trackId: string) {
    return this.analyticsService.logPlayback({
      storeId,
      trackId,
      eventType: PlaybackEventType.TRACK_PLAYED,
    });
  }

  /**
   * Registra fine riproduzione traccia
   */
  async trackEnded(storeId: string, trackId: string) {
    return this.analyticsService.logPlayback({
      storeId,
      trackId,
      eventType: PlaybackEventType.TRACK_SKIPPED,
    });
  }

  /**
   * Registra riproduzione annuncio
   */
  async announcementPlayed(storeId: string, announcementId: string) {
    // Registra nel log
    await this.analyticsService.logPlayback({
      storeId,
      announcementId,
      eventType: PlaybackEventType.ANNOUNCEMENT_PLAYED,
    });

    // Incrementa il contatore dell'annuncio
    await this.prisma.announcement.update({
      where: { id: announcementId },
      data: {
        playCount: { increment: 1 },
        lastPlayedAt: new Date(),
      },
    });

    return { status: 'ok' };
  }

  /**
   * Scarica contenuti per offline mode
   */
  async getOfflineContent(storeId: string, deviceId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, deviceId },
      include: {
        activePlaylist: {
          include: {
            tracks: true,
          },
        },
        cartwallItems: {
          where: { isActive: true },
          include: {
            announcement: true,
          },
        },
        scheduleRules: {
          where: { isActive: true },
          include: {
            playlist: {
              include: {
                tracks: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      throw new UnauthorizedException('Dispositivo non autorizzato');
    }

    // Raccogli tutti i file audio necessari
    const audioFiles: Array<{ type: string; id: string; url: string }> = [];

    // Tracce della playlist attiva
    if (store.activePlaylist) {
      store.activePlaylist.tracks.forEach(track => {
        audioFiles.push({
          type: 'track',
          id: track.id,
          url: track.fileUrl,
        });
      });
    }

    // Tracce delle playlist in programmazione
    store.scheduleRules.forEach(rule => {
      rule.playlist.tracks.forEach(track => {
        if (!audioFiles.find(f => f.id === track.id)) {
          audioFiles.push({
            type: 'track',
            id: track.id,
            url: track.fileUrl,
          });
        }
      });
    });

    // Annunci del cartwall
    store.cartwallItems.forEach(item => {
      if (item.announcement.audioUrl) {
        audioFiles.push({
          type: 'announcement',
          id: item.announcement.id,
          url: item.announcement.audioUrl,
        });
      }
    });

    return {
      store: {
        id: store.id,
        name: store.name,
      },
      audioFiles,
      playlists: [
        store.activePlaylist,
        ...store.scheduleRules.map(r => r.playlist),
      ].filter(Boolean),
      announcements: store.cartwallItems.map(i => i.announcement),
      schedule: store.scheduleRules,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Sincronizza stato dal player
   */
  async syncState(storeId: string, deviceId: string, state: any) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, deviceId },
    });

    if (!store) {
      throw new UnauthorizedException('Dispositivo non autorizzato');
    }

    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        lastSeen: new Date(),
        isOnline: true,
        currentVolume: state.volume,
        deviceInfo: {
          ...store.deviceInfo as any,
          lastState: state,
        },
      },
    });

    return { status: 'synced' };
  }
}
