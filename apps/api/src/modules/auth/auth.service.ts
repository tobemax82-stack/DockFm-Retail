import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
    organization: {
      id: string;
      name: string;
      plan: string;
    };
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email già registrata');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create organization and user
    const organization = await this.prisma.organization.create({
      data: {
        name: dto.organizationName,
        slug: this.generateSlug(dto.organizationName),
        sector: dto.sector || 'OTHER',
        plan: 'SOLO',
        maxStores: 1,
        users: {
          create: {
            email: dto.email,
            passwordHash,
            name: dto.name,
            role: 'ADMIN',
          },
        },
      },
      include: {
        users: true,
      },
    });

    const user = organization.users[0];

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, organization.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: organization.id,
        organization: {
          id: organization.id,
          name: organization.name,
          plan: organization.plan,
        },
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account disattivato');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.organizationId,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          plan: user.organization.plan,
        },
      },
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Token non valido');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedException('Token scaduto');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utente non trovato');
    }

    // Delete old token
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    return this.generateTokens(user.id, user.email, user.role, user.organizationId);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        managedStores: {
          include: { store: true },
        },
      },
    });
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    organizationId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
      organizationId,
    };

    const accessToken = this.jwtService.sign(payload);

    // Create refresh token
    const refreshToken = uuidv4();
    const refreshExpiresIn = this.configService.get<number>('JWT_REFRESH_EXPIRES_DAYS') || 7;

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + refreshExpiresIn * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `${baseSlug}-${uuidv4().slice(0, 8)}`;
  }
}
