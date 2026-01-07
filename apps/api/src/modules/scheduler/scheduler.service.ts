import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScheduleRuleDto, UpdateScheduleRuleDto } from './dto/scheduler.dto';
import { Prisma, DayOfWeek } from '@prisma/client';

@Injectable()
export class SchedulerService {
  constructor(private prisma: PrismaService) {}

  async findAllForStore(storeId: string, organizationId: string) {
    // Verifica che lo store appartenga all'organizzazione
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, organizationId },
    });

    if (!store) {
      throw new NotFoundException('Negozio non trovato');
    }

    return this.prisma.scheduleRule.findMany({
      where: { storeId },
      include: {
        playlist: {
          select: {
            id: true,
            name: true,
            mood: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string, organizationId: string) {
    const rule = await this.prisma.scheduleRule.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        playlist: true,
      },
    });

    if (!rule) {
      throw new NotFoundException('Regola non trovata');
    }

    if (rule.store.organizationId !== organizationId) {
      throw new NotFoundException('Regola non trovata');
    }

    return rule;
  }

  async create(dto: CreateScheduleRuleDto, organizationId: string) {
    // Verifica che lo store appartenga all'organizzazione
    const store = await this.prisma.store.findFirst({
      where: { id: dto.storeId, organizationId },
    });

    if (!store) {
      throw new NotFoundException('Negozio non trovato');
    }

    // Verifica che la playlist appartenga all'organizzazione
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: dto.playlistId, organizationId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist non trovata');
    }

    // Verifica sovrapposizioni
    await this.checkOverlap(dto.storeId, dto.dayOfWeek, dto.startTime, dto.endTime);

    return this.prisma.scheduleRule.create({
      data: dto,
      include: {
        playlist: {
          select: {
            id: true,
            name: true,
            mood: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateScheduleRuleDto, organizationId: string) {
    const existingRule = await this.findOne(id, organizationId);

    // Se cambiano orari o giorno, verifica sovrapposizioni
    if (dto.startTime || dto.endTime || dto.dayOfWeek) {
      const storeId = dto.storeId || existingRule.storeId;
      const dayOfWeek = dto.dayOfWeek || existingRule.dayOfWeek;
      const startTime = dto.startTime || existingRule.startTime;
      const endTime = dto.endTime || existingRule.endTime;

      await this.checkOverlap(storeId, dayOfWeek, startTime, endTime, id);
    }

    // Se cambia la playlist, verifica che appartenga all'organizzazione
    if (dto.playlistId) {
      const playlist = await this.prisma.playlist.findFirst({
        where: { id: dto.playlistId, organizationId },
      });

      if (!playlist) {
        throw new NotFoundException('Playlist non trovata');
      }
    }

    return this.prisma.scheduleRule.update({
      where: { id },
      data: dto,
      include: {
        playlist: {
          select: {
            id: true,
            name: true,
            mood: true,
          },
        },
      },
    });
  }

  async delete(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.scheduleRule.delete({
      where: { id },
    });
  }

  async getScheduleForDay(storeId: string, dayOfWeek: DayOfWeek) {
    return this.prisma.scheduleRule.findMany({
      where: {
        storeId,
        dayOfWeek,
        isActive: true,
      },
      include: {
        playlist: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getCurrentPlaylist(storeId: string) {
    const now = new Date();
    const dayOfWeek = this.getDayOfWeek(now);
    const currentTime = this.formatTime(now);

    const rule = await this.prisma.scheduleRule.findFirst({
      where: {
        storeId,
        dayOfWeek,
        isActive: true,
        startTime: { lte: currentTime },
        endTime: { gt: currentTime },
      },
      include: {
        playlist: {
          include: {
            tracks: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return rule?.playlist || null;
  }

  async bulkCreate(storeId: string, rules: CreateScheduleRuleDto[], organizationId: string) {
    // Verifica che lo store appartenga all'organizzazione
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, organizationId },
    });

    if (!store) {
      throw new NotFoundException('Negozio non trovato');
    }

    // Crea tutte le regole in una transazione
    return this.prisma.$transaction(
      rules.map(rule => 
        this.prisma.scheduleRule.create({
          data: { ...rule, storeId },
        })
      )
    );
  }

  async copySchedule(sourceStoreId: string, targetStoreId: string, organizationId: string) {
    // Verifica che entrambi gli store appartengano all'organizzazione
    const [sourceStore, targetStore] = await Promise.all([
      this.prisma.store.findFirst({ where: { id: sourceStoreId, organizationId } }),
      this.prisma.store.findFirst({ where: { id: targetStoreId, organizationId } }),
    ]);

    if (!sourceStore || !targetStore) {
      throw new NotFoundException('Uno o più negozi non trovati');
    }

    // Ottieni le regole dello store sorgente
    const sourceRules = await this.prisma.scheduleRule.findMany({
      where: { storeId: sourceStoreId },
    });

    // Elimina le regole esistenti del target
    await this.prisma.scheduleRule.deleteMany({
      where: { storeId: targetStoreId },
    });

    // Crea le nuove regole
    const newRules = sourceRules.map(rule => ({
      storeId: targetStoreId,
      playlistId: rule.playlistId,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      volume: rule.volume,
      isActive: rule.isActive,
    }));

    return this.prisma.scheduleRule.createMany({
      data: newRules,
    });
  }

  async getWeeklyOverview(storeId: string) {
    const rules = await this.prisma.scheduleRule.findMany({
      where: { storeId, isActive: true },
      include: {
        playlist: {
          select: {
            id: true,
            name: true,
            mood: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    // Raggruppa per giorno
    const weeklySchedule: Record<DayOfWeek, typeof rules> = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
      SUNDAY: [],
    };

    rules.forEach(rule => {
      weeklySchedule[rule.dayOfWeek].push(rule);
    });

    return weeklySchedule;
  }

  // === METODI PRIVATI ===

  private async checkOverlap(
    storeId: string,
    dayOfWeek: DayOfWeek,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) {
    const overlapping = await this.prisma.scheduleRule.findFirst({
      where: {
        storeId,
        dayOfWeek,
        id: excludeId ? { not: excludeId } : undefined,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        `Esiste già una regola per ${dayOfWeek} che si sovrappone all'orario ${startTime}-${endTime}`
      );
    }
  }

  private getDayOfWeek(date: Date): DayOfWeek {
    const days: DayOfWeek[] = [
      'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'
    ];
    return days[date.getDay()];
  }

  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }
}
