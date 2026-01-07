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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto, UpdatePlanDto, UpdateSettingsDto } from './dto/organizations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Organizzazioni')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Lista tutte le organizzazioni (Solo Super Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista organizzazioni' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.organizationsService.findAll(page, limit);
  }

  @Get('me')
  @ApiOperation({ summary: 'Dettaglio organizzazione corrente' })
  @ApiResponse({ status: 200, description: 'Dettagli organizzazione' })
  findMine(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.organizationsService.findOne(orgId, orgId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dettaglio organizzazione' })
  @ApiResponse({ status: 200, description: 'Dettagli organizzazione' })
  @ApiResponse({ status: 404, description: 'Organizzazione non trovata' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.organizationsService.findOne(id, orgId, role);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Statistiche organizzazione' })
  @ApiResponse({ status: 200, description: 'Statistiche' })
  getStats(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    // Verifica accesso
    if (role !== 'SUPER_ADMIN' && id !== orgId) {
      return { error: 'Non autorizzato' };
    }
    return this.organizationsService.getStats(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crea nuova organizzazione (Solo Super Admin)' })
  @ApiResponse({ status: 201, description: 'Organizzazione creata' })
  @ApiResponse({ status: 409, description: 'Slug già in uso' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Aggiorna organizzazione (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Organizzazione aggiornata' })
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto, role);
  }

  @Patch(':id/settings')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Aggiorna impostazioni organizzazione' })
  @ApiResponse({ status: 200, description: 'Impostazioni aggiornate' })
  updateSettings(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.organizationsService.updateSettings(id, updateSettingsDto.settings, orgId, role);
  }

  @Patch(':id/plan')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Aggiorna piano organizzazione (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Piano aggiornato' })
  updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.organizationsService.updatePlan(id, updatePlanDto.plan, role);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Disattiva organizzazione (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Organizzazione disattivata' })
  remove(
    @Param('id') id: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.organizationsService.delete(id, role);
  }
}
