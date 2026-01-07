import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlaybackLogDto } from './dto/analytics.dto';
import { PlaybackEventType, Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra un evento di playback
   */
  async logPlayback(dto: PlaybackLogDto) {
    return this.prisma.playbackLog.create({
      data: {
        storeId: dto.storeId,
        trackId: dto.trackId,
        announcementId: dto.announcementId,
        eventType: dto.eventType,
        timestamp: new Date(),
        metadata: dto.metadata,
      },
    });
  }

  /**
   * Dashboard overview per organizzazione
   */
  async getDashboardOverview(organizationId: string) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStores,
      onlineStores,
      totalPlaylists,
      totalAnnouncements,
      playsToday,
      playsThisWeek,
      playsThisMonth,
    ] = await Promise.all([
      this.prisma.store.count({ where: { organizationId, isActive: true } }),
      this.prisma.store.count({ where: { organizationId, isOnline: true } }),
      this.prisma.playlist.count({ where: { organizationId } }),
      this.prisma.announcement.count({ where: { organizationId } }),
      this.countPlaybacks(organizationId, startOfDay),
      this.countPlaybacks(organizationId, startOfWeek),
      this.countPlaybacks(organizationId, startOfMonth),
    ]);

    return {
      stores: {
        total: totalStores,
        online: onlineStores,
        offline: totalStores - onlineStores,
      },
      content: {
        playlists: totalPlaylists,
        announcements: totalAnnouncements,
      },
      playbacks: {
        today: playsToday,
        thisWeek: playsThisWeek,
        thisMonth: playsThisMonth,
      },
    };
  }

  /**
   * Statistiche per store
   */
  async getStoreStats(storeId: string, from?: Date, to?: Date) {
    const where: Prisma.PlaybackLogWhereInput = {
      storeId,
      ...(from && { timestamp: { gte: from } }),
      ...(to && { timestamp: { lte: to } }),
    };

    const [
      totalPlaybacks,
      trackPlaybacks,
      announcementPlaybacks,
      topTracks,
      playbacksByHour,
    ] = await Promise.all([
      this.prisma.playbackLog.count({ where }),
      this.prisma.playbackLog.count({ 
        where: { ...where, trackId: { not: null } } 
      }),
      this.prisma.playbackLog.count({ 
        where: { ...where, announcementId: { not: null } } 
      }),
      this.getTopTracks(storeId, from, to, 10),
      this.getPlaybacksByHour(storeId, from, to),
    ]);

    return {
      total: totalPlaybacks,
      tracks: trackPlaybacks,
      announcements: announcementPlaybacks,
      topTracks,
      hourlyDistribution: playbacksByHour,
    };
  }

  /**
   * Tracce più riprodotte
   */
  async getTopTracks(storeId: string, from?: Date, to?: Date, limit = 10) {
    const where: Prisma.PlaybackLogWhereInput = {
      storeId,
      trackId: { not: null },
      eventType: PlaybackEventType.TRACK_PLAYED,
      ...(from && { timestamp: { gte: from } }),
      ...(to && { timestamp: { lte: to } }),
    };

    const playbacks = await this.prisma.playbackLog.groupBy({
      by: ['trackId'],
      where,
      _count: { trackId: true },
      orderBy: { _count: { trackId: 'desc' } },
      take: limit,
    });

    // Ottieni i dettagli delle tracce
    const trackIds = playbacks.map(p => p.trackId).filter(Boolean) as string[];
    const tracks = await this.prisma.track.findMany({
      where: { id: { in: trackIds } },
      select: {
        id: true,
        title: true,
        artist: true,
        duration: true,
      },
    });

    const trackMap = new Map(tracks.map(t => [t.id, t]));

    return playbacks.map(p => ({
      track: trackMap.get(p.trackId!),
      playCount: p._count.trackId,
    }));
  }

  /**
   * Annunci più riprodotti
   */
  async getTopAnnouncements(organizationId: string, limit = 10) {
    return this.prisma.announcement.findMany({
      where: { organizationId },
      orderBy: { playCount: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        type: true,
        playCount: true,
        lastPlayedAt: true,
      },
    });
  }

  /**
   * Distribuzione riproduzione per ora del giorno
   */
  async getPlaybacksByHour(storeId: string, from?: Date, to?: Date) {
    // Questa è una query raw perché Prisma non supporta nativamente GROUP BY HOUR
    const result = await this.prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
      SELECT EXTRACT(HOUR FROM timestamp) as hour, COUNT(*) as count
      FROM "PlaybackLog"
      WHERE "storeId" = ${storeId}
        AND "eventType" = 'TRACK_PLAYED'
        ${from ? Prisma.sql`AND timestamp >= ${from}` : Prisma.empty}
        ${to ? Prisma.sql`AND timestamp <= ${to}` : Prisma.empty}
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY hour
    `;

    // Normalizza il risultato (0-23 ore)
    const hourlyData = Array(24).fill(0);
    result.forEach(r => {
      hourlyData[Number(r.hour)] = Number(r.count);
    });

    return hourlyData;
  }

  /**
   * Attività recenti
   */
  async getRecentActivity(organizationId: string, limit = 50) {
    return this.prisma.activityLog.findMany({
      where: { organizationId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Log attività utente
   */
  async logActivity(
    organizationId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: any,
  ) {
    return this.prisma.activityLog.create({
      data: {
        organizationId,
        userId,
        action,
        entityType,
        entityId,
        metadata,
      },
    });
  }

  /**
   * Statistiche per periodo
   */
  async getStatsByPeriod(
    organizationId: string, 
    period: 'day' | 'week' | 'month',
    from?: Date,
    to?: Date,
  ) {
    const storeIds = await this.prisma.store.findMany({
      where: { organizationId },
      select: { id: true },
    }).then(stores => stores.map(s => s.id));

    const startDate = from || this.getStartDate(period);
    const endDate = to || new Date();

    const playbacks = await this.prisma.playbackLog.findMany({
      where: {
        storeId: { in: storeIds },
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        timestamp: true,
        eventType: true,
      },
    });

    // Raggruppa per data
    const byDate = new Map<string, number>();
    playbacks.forEach(p => {
      const date = p.timestamp.toISOString().split('T')[0];
      byDate.set(date, (byDate.get(date) || 0) + 1);
    });

    return Array.from(byDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Uptime per store
   */
  async getStoreUptime(storeId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Conta i giorni in cui lo store è stato online
    const logs = await this.prisma.playbackLog.findMany({
      where: {
        storeId,
        timestamp: { gte: startDate },
      },
      select: {
        timestamp: true,
      },
      distinct: ['timestamp'],
    });

    // Conta giorni unici con attività
    const uniqueDays = new Set(
      logs.map(l => l.timestamp.toISOString().split('T')[0])
    );

    return {
      activeDays: uniqueDays.size,
      totalDays: days,
      uptimePercentage: Math.round((uniqueDays.size / days) * 100),
    };
  }

  // === METODI PRIVATI ===

  private async countPlaybacks(organizationId: string, since: Date) {
    const storeIds = await this.prisma.store.findMany({
      where: { organizationId },
      select: { id: true },
    }).then(stores => stores.map(s => s.id));

    return this.prisma.playbackLog.count({
      where: {
        storeId: { in: storeIds },
        timestamp: { gte: since },
      },
    });
  }

  private getStartDate(period: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return new Date(now.setHours(0, 0, 0, 0));
    }
  }
}
