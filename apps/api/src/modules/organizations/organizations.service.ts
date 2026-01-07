import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organizations.dto';
import { UserRole, Plan, BusinessSector } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          sector: true,
          isActive: true,
          settings: true,
          _count: {
            select: {
              stores: true,
              users: true,
            },
          },
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count(),
    ]);

    return {
      data: organizations.map(org => ({
        ...org,
        storeCount: org._count.stores,
        userCount: org._count.users,
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

  async findOne(id: string, currentUserOrgId?: string, currentUserRole?: UserRole) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        stores: {
          select: {
            id: true,
            name: true,
            city: true,
            isActive: true,
            isOnline: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            stores: true,
            users: true,
            playlists: true,
            announcements: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organizzazione non trovata');
    }

    // Verifica accesso (solo SUPER_ADMIN o membri della stessa org)
    if (currentUserRole !== 'SUPER_ADMIN' && id !== currentUserOrgId) {
      throw new ForbiddenException('Non hai accesso a questa organizzazione');
    }

    return {
      ...organization,
      stats: {
        storeCount: organization._count.stores,
        userCount: organization._count.users,
        playlistCount: organization._count.playlists,
        announcementCount: organization._count.announcements,
      },
      _count: undefined,
    };
  }

  async findBySlug(slug: string) {
    return this.prisma.organization.findUnique({
      where: { slug },
    });
  }

  async create(createOrganizationDto: CreateOrganizationDto) {
    const { name, slug, ...data } = createOrganizationDto;

    // Verifica slug univoco
    const existingOrg = await this.findBySlug(slug || this.generateSlug(name));
    if (existingOrg) {
      throw new ConflictException('Slug già in uso');
    }

    const organization = await this.prisma.organization.create({
      data: {
        name,
        slug: slug || this.generateSlug(name),
        ...data,
      },
    });

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto, currentUserRole?: UserRole) {
    if (currentUserRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Solo i Super Admin possono modificare le organizzazioni');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organizzazione non trovata');
    }

    // Se viene cambiato lo slug, verifica che sia univoco
    if (updateOrganizationDto.slug && updateOrganizationDto.slug !== organization.slug) {
      const existingOrg = await this.findBySlug(updateOrganizationDto.slug);
      if (existingOrg) {
        throw new ConflictException('Slug già in uso');
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });
  }

  async delete(id: string, currentUserRole?: UserRole) {
    if (currentUserRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Solo i Super Admin possono eliminare le organizzazioni');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: { stores: true, users: true },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organizzazione non trovata');
    }

    // Soft delete - disattiva invece di eliminare
    return this.prisma.organization.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateSettings(id: string, settings: any, currentUserOrgId?: string, currentUserRole?: UserRole) {
    if (currentUserRole !== 'SUPER_ADMIN' && id !== currentUserOrgId) {
      throw new ForbiddenException('Non hai accesso a questa organizzazione');
    }

    return this.prisma.organization.update({
      where: { id },
      data: { settings },
    });
  }

  async updatePlan(id: string, plan: Plan, currentUserRole?: UserRole) {
    if (currentUserRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Solo i Super Admin possono cambiare i piani');
    }

    return this.prisma.organization.update({
      where: { id },
      data: { plan },
    });
  }

  async getStats(id: string) {
    const [
      storeCount,
      userCount,
      playlistCount,
      announcementCount,
      activeStores,
      onlineStores,
    ] = await Promise.all([
      this.prisma.store.count({ where: { organizationId: id } }),
      this.prisma.user.count({ where: { organizationId: id } }),
      this.prisma.playlist.count({ where: { organizationId: id } }),
      this.prisma.announcement.count({ where: { organizationId: id } }),
      this.prisma.store.count({ where: { organizationId: id, isActive: true } }),
      this.prisma.store.count({ where: { organizationId: id, isOnline: true } }),
    ]);

    return {
      stores: {
        total: storeCount,
        active: activeStores,
        online: onlineStores,
      },
      users: userCount,
      playlists: playlistCount,
      announcements: announcementCount,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
