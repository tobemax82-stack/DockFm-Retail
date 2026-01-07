import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto, ActivateStoreDto } from './dto/stores.dto';
import { UserRole, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = {
      organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          country: true,
          timezone: true,
          isActive: true,
          isOnline: true,
          currentVolume: true,
          lastSeen: true,
          activationCode: true,
          activePlaylist: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              scheduleRules: true,
              cartwallItems: true,
            },
          },
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.store.count({ where }),
    ]);

    return {
      data: stores.map(store => ({
        ...store,
        scheduleRulesCount: store._count.scheduleRules,
        cartwallItemsCount: store._count.cartwallItems,
        _count: undefined,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id, organizationId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
        activePlaylist: {
          include: {
            tracks: {
              take: 10,
              orderBy: { order: 'asc' },
            },
          },
        },
        managers: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        scheduleRules: {
          orderBy: { startTime: 'asc' },
        },
        cartwallItems: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
          include: {
            announcement: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Negozio non trovato');
    }

    return store;
  }

  async findByActivationCode(code: string) {
    const store = await this.prisma.store.findFirst({
      where: { 
        activationCode: code,
        isActive: true,
      },
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
      },
    });

    return store;
  }

  async create(createStoreDto: CreateStoreDto, organizationId: string) {
    const activationCode = this.generateActivationCode();

    const store = await this.prisma.store.create({
      data: {
        ...createStoreDto,
        organizationId,
        activationCode,
      },
    });

    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto, organizationId: string) {
    const store = await this.findOne(id, organizationId);

    return this.prisma.store.update({
      where: { id },
      data: updateStoreDto,
    });
  }

  async delete(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    // Soft delete
    return this.prisma.store.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(activateDto: ActivateStoreDto) {
    const store = await this.findByActivationCode(activateDto.activationCode);

    if (!store) {
      throw new NotFoundException('Codice di attivazione non valido');
    }

    // Genera un nuovo codice dispositivo
    const deviceId = this.generateDeviceId();

    // Aggiorna lo store con le info del dispositivo
    const updatedStore = await this.prisma.store.update({
      where: { id: store.id },
      data: {
        deviceId,
        isOnline: true,
        lastSeen: new Date(),
        // Rigenera il codice di attivazione per sicurezza
        activationCode: this.generateActivationCode(),
      },
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
      },
    });

    return {
      store: updatedStore,
      deviceId,
      message: 'Player attivato con successo',
    };
  }

  async regenerateActivationCode(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    const newCode = this.generateActivationCode();

    return this.prisma.store.update({
      where: { id },
      data: { activationCode: newCode },
      select: {
        id: true,
        name: true,
        activationCode: true,
      },
    });
  }

  async updateStatus(id: string, isOnline: boolean, deviceInfo?: any) {
    return this.prisma.store.update({
      where: { id },
      data: {
        isOnline,
        lastSeen: new Date(),
        ...(deviceInfo && { deviceInfo }),
      },
    });
  }

  async setActivePlaylist(id: string, playlistId: string, organizationId: string) {
    await this.findOne(id, organizationId);

    // Verifica che la playlist appartenga alla stessa organizzazione
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId, organizationId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist non trovata');
    }

    return this.prisma.store.update({
      where: { id },
      data: { activePlaylistId: playlistId },
      include: {
        activePlaylist: true,
      },
    });
  }

  async setVolume(id: string, volume: number) {
    if (volume < 0 || volume > 100) {
      throw new ConflictException('Il volume deve essere tra 0 e 100');
    }

    return this.prisma.store.update({
      where: { id },
      data: { currentVolume: volume },
    });
  }

  async getOnlineStores(organizationId: string) {
    return this.prisma.store.findMany({
      where: {
        organizationId,
        isOnline: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        city: true,
        currentVolume: true,
        lastSeen: true,
        activePlaylist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  private generateActivationCode(): string {
    // Genera un codice a 6 cifre
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  private generateDeviceId(): string {
    return `device_${randomBytes(16).toString('hex')}`;
  }
}
