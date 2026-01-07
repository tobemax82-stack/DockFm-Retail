import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Utenti')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Lista tutti gli utenti' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista utenti con paginazione' })
  findAll(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('role') role: UserRole,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const organizationId = role === 'SUPER_ADMIN' ? undefined : orgId;
    return this.usersService.findAll(organizationId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dettaglio utente' })
  @ApiResponse({ status: 200, description: 'Dettagli utente' })
  @ApiResponse({ status: 404, description: 'Utente non trovato' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.usersService.findOne(id, orgId, role);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crea nuovo utente' })
  @ApiResponse({ status: 201, description: 'Utente creato con successo' })
  @ApiResponse({ status: 409, description: 'Email già in uso' })
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.usersService.create(createUserDto, orgId, role);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Aggiorna utente' })
  @ApiResponse({ status: 200, description: 'Utente aggiornato' })
  @ApiResponse({ status: 404, description: 'Utente non trovato' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.usersService.update(id, updateUserDto, orgId, role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Disattiva utente' })
  @ApiResponse({ status: 200, description: 'Utente disattivato' })
  @ApiResponse({ status: 404, description: 'Utente non trovato' })
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.usersService.delete(id, orgId, role);
  }

  @Post(':id/stores/:storeId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Assegna utente a un negozio' })
  @ApiResponse({ status: 200, description: 'Utente assegnato al negozio' })
  assignToStore(
    @Param('id') userId: string,
    @Param('storeId') storeId: string,
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.usersService.assignToStore(userId, storeId, orgId, role);
  }

  @Delete(':id/stores/:storeId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Rimuovi utente da un negozio' })
  @ApiResponse({ status: 200, description: 'Utente rimosso dal negozio' })
  removeFromStore(
    @Param('id') userId: string,
    @Param('storeId') storeId: string,
  ) {
    return this.usersService.removeFromStore(userId, storeId);
  }
}
