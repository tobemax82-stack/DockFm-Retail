import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { UserRole, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.UserWhereInput = organizationId 
      ? { organizationId } 
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, currentUserOrgId?: string, currentUserRole?: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
        managedStores: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utente non trovato');
    }

    // Verifica accesso multi-tenant
    if (currentUserRole !== 'SUPER_ADMIN' && user.organizationId !== currentUserOrgId) {
      throw new ForbiddenException('Non hai accesso a questo utente');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
        managedStores: true,
      },
    });
  }

  async create(createUserDto: CreateUserDto, creatorOrgId?: string, creatorRole?: UserRole) {
    const { email, password, organizationId, ...data } = createUserDto;

    // Verifica che l'email non sia già in uso
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email già in uso');
    }

    // Verifica permessi
    const targetOrgId = organizationId || creatorOrgId;
    
    if (creatorRole !== 'SUPER_ADMIN' && organizationId && organizationId !== creatorOrgId) {
      throw new ForbiddenException('Non puoi creare utenti in altre organizzazioni');
    }

    // Solo SUPER_ADMIN può creare altri SUPER_ADMIN
    if (data.role === 'SUPER_ADMIN' && creatorRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Solo i Super Admin possono creare altri Super Admin');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        organizationId: targetOrgId,
        ...data,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserOrgId?: string, currentUserRole?: UserRole) {
    const user = await this.findOne(id, currentUserOrgId, currentUserRole);

    const { password, organizationId, ...data } = updateUserDto;

    // Non permettere cambio organizzazione se non SUPER_ADMIN
    if (organizationId && organizationId !== user.organizationId && currentUserRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Non puoi spostare utenti tra organizzazioni');
    }

    // Solo SUPER_ADMIN può promuovere a SUPER_ADMIN
    if (data.role === 'SUPER_ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Solo i Super Admin possono promuovere a Super Admin');
    }

    const updateData: any = { ...data };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (organizationId) {
      updateData.organizationId = organizationId;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        organizationId: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string, currentUserOrgId?: string, currentUserRole?: UserRole) {
    await this.findOne(id, currentUserOrgId, currentUserRole);

    // Soft delete - disattiva l'utente invece di eliminarlo
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async assignToStore(userId: string, storeId: string, currentUserOrgId?: string, currentUserRole?: UserRole) {
    const user = await this.findOne(userId, currentUserOrgId, currentUserRole);

    // Verifica che lo store esista e appartenga alla stessa organizzazione
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Negozio non trovato');
    }

    if (store.organizationId !== user.organizationId) {
      throw new ForbiddenException('Il negozio e l\'utente devono appartenere alla stessa organizzazione');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        managedStores: {
          connect: { id: storeId },
        },
      },
      include: {
        managedStores: true,
      },
    });
  }

  async removeFromStore(userId: string, storeId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        managedStores: {
          disconnect: { id: storeId },
        },
      },
      include: {
        managedStores: true,
      },
    });
  }
}
