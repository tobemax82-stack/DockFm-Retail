import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcements.dto';
import { AnnouncementType, Prisma } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    organizationId: string, 
    page = 1, 
    limit = 20, 
    type?: AnnouncementType,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.AnnouncementWhereInput = {
      organizationId,
      ...(type && { type }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { text: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [announcements, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        select: {
          id: true,
          name: true,
          type: true,
          text: true,
          audioUrl: true,
          duration: true,
          voiceId: true,
          isActive: true,
          priority: true,
          validFrom: true,
          validTo: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return {
      data: announcements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string) {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, organizationId },
      include: {
        cartwallItems: {
          include: {
            store: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!announcement) {
      throw new NotFoundException('Annuncio non trovato');
    }

    return announcement;
  }

  async create(createDto: CreateAnnouncementDto, organizationId: string) {
    // Valida le date se specificate
    if (createDto.validFrom && createDto.validTo) {
      if (new Date(createDto.validFrom) >= new Date(createDto.validTo)) {
        throw new BadRequestException('La data di inizio deve essere precedente alla data di fine');
      }
    }

    return this.prisma.announcement.create({
      data: {
        ...createDto,
        organizationId,
        validFrom: createDto.validFrom ? new Date(createDto.validFrom) : null,
        validTo: createDto.validTo ? new Date(createDto.validTo) : null,
      },
    });
  }

  async update(id: string, updateDto: UpdateAnnouncementDto, organizationId: string) {
    await this.findOne(id, organizationId);

    // Valida le date se specificate
    if (updateDto.validFrom && updateDto.validTo) {
      if (new Date(updateDto.validFrom) >= new Date(updateDto.validTo)) {
        throw new BadRequestException('La data di inizio deve essere precedente alla data di fine');
      }
    }

    return this.prisma.announcement.update({
      where: { id },
      data: {
        ...updateDto,
        validFrom: updateDto.validFrom ? new Date(updateDto.validFrom) : undefined,
        validTo: updateDto.validTo ? new Date(updateDto.validTo) : undefined,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    // Prima rimuovi dai cartwall
    await this.prisma.cartwallItem.deleteMany({
      where: { announcementId: id },
    });

    return this.prisma.announcement.delete({
      where: { id },
    });
  }

  async getActiveAnnouncements(organizationId: string) {
    const now = new Date();

    return this.prisma.announcement.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { validFrom: null, validTo: null },
          {
            AND: [
              { validFrom: { lte: now } },
              { OR: [{ validTo: null }, { validTo: { gte: now } }] },
            ],
          },
        ],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getByType(organizationId: string, type: AnnouncementType) {
    return this.prisma.announcement.findMany({
      where: { organizationId, type, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToCartwall(announcementId: string, storeId: string, position: number) {
    // Verifica che l'annuncio esista
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundException('Annuncio non trovato');
    }

    // Verifica che lo store esista e appartenga alla stessa organizzazione
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || store.organizationId !== announcement.organizationId) {
      throw new BadRequestException('Store non valido');
    }

    // Verifica se esiste già un item in quella posizione
    const existing = await this.prisma.cartwallItem.findFirst({
      where: { storeId, position },
    });

    if (existing) {
      // Aggiorna l'esistente
      return this.prisma.cartwallItem.update({
        where: { id: existing.id },
        data: { announcementId },
        include: { announcement: true },
      });
    }

    // Crea nuovo item
    return this.prisma.cartwallItem.create({
      data: {
        storeId,
        announcementId,
        position,
      },
      include: { announcement: true },
    });
  }

  async removeFromCartwall(storeId: string, position: number) {
    const item = await this.prisma.cartwallItem.findFirst({
      where: { storeId, position },
    });

    if (!item) {
      throw new NotFoundException('Item non trovato');
    }

    return this.prisma.cartwallItem.delete({
      where: { id: item.id },
    });
  }

  async getCartwallForStore(storeId: string) {
    return this.prisma.cartwallItem.findMany({
      where: { storeId, isActive: true },
      orderBy: { position: 'asc' },
      include: {
        announcement: true,
      },
    });
  }

  async incrementPlayCount(id: string) {
    return this.prisma.announcement.update({
      where: { id },
      data: {
        playCount: { increment: 1 },
        lastPlayedAt: new Date(),
      },
    });
  }

  async getScheduledAnnouncements(organizationId: string, date: Date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return this.prisma.announcement.findMany({
      where: {
        organizationId,
        isActive: true,
        validFrom: { lte: dayEnd },
        OR: [
          { validTo: null },
          { validTo: { gte: dayStart } },
        ],
      },
      orderBy: [{ priority: 'desc' }, { validFrom: 'asc' }],
    });
  }
}
