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
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto, AddToCartwallDto } from './dto/announcements.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, AnnouncementType } from '@prisma/client';

@ApiTags('Annunci')
@ApiBearerAuth()
@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista tutti gli annunci' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: AnnouncementType })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista annunci' })
  findAll(
    @CurrentUser('organizationId') orgId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: AnnouncementType,
    @Query('search') search?: string,
  ) {
    return this.announcementsService.findAll(orgId, page, limit, type, search);
  }

  @Get('active')
  @ApiOperation({ summary: 'Lista annunci attivi e validi' })
  @ApiResponse({ status: 200, description: 'Lista annunci attivi' })
  getActive(@CurrentUser('organizationId') orgId: string) {
    return this.announcementsService.getActiveAnnouncements(orgId);
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Lista annunci per tipo' })
  @ApiResponse({ status: 200, description: 'Lista annunci filtrati per tipo' })
  getByType(
    @Param('type') type: AnnouncementType,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.announcementsService.getByType(orgId, type);
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'Annunci schedulati per oggi' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Data ISO (default: oggi)' })
  @ApiResponse({ status: 200, description: 'Lista annunci schedulati' })
  getScheduled(
    @CurrentUser('organizationId') orgId: string,
    @Query('date') date?: string,
  ) {
    const targetDate = date ? new Date(date) : new Date();
    return this.announcementsService.getScheduledAnnouncements(orgId, targetDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dettaglio annuncio' })
  @ApiResponse({ status: 200, description: 'Dettagli annuncio' })
  @ApiResponse({ status: 404, description: 'Annuncio non trovato' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.announcementsService.findOne(id, orgId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crea nuovo annuncio' })
  @ApiResponse({ status: 201, description: 'Annuncio creato' })
  create(
    @Body() createDto: CreateAnnouncementDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.announcementsService.create(createDto, orgId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Aggiorna annuncio' })
  @ApiResponse({ status: 200, description: 'Annuncio aggiornato' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAnnouncementDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.announcementsService.update(id, updateDto, orgId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Elimina annuncio' })
  @ApiResponse({ status: 200, description: 'Annuncio eliminato' })
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.announcementsService.delete(id, orgId);
  }

  @Post(':id/played')
  @ApiOperation({ summary: 'Registra riproduzione annuncio' })
  @ApiResponse({ status: 200, description: 'Play count incrementato' })
  markPlayed(@Param('id') id: string) {
    return this.announcementsService.incrementPlayCount(id);
  }

  @Post('cartwall')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER)
  @ApiOperation({ summary: 'Aggiungi annuncio al cartwall di uno store' })
  @ApiResponse({ status: 201, description: 'Aggiunto al cartwall' })
  addToCartwall(@Body() addDto: AddToCartwallDto) {
    return this.announcementsService.addToCartwall(
      addDto.announcementId,
      addDto.storeId,
      addDto.position,
    );
  }

  @Delete('cartwall/:storeId/:position')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER)
  @ApiOperation({ summary: 'Rimuovi annuncio dal cartwall' })
  @ApiResponse({ status: 200, description: 'Rimosso dal cartwall' })
  removeFromCartwall(
    @Param('storeId') storeId: string,
    @Param('position') position: number,
  ) {
    return this.announcementsService.removeFromCartwall(storeId, +position);
  }

  @Get('cartwall/:storeId')
  @ApiOperation({ summary: 'Ottieni cartwall di uno store' })
  @ApiResponse({ status: 200, description: 'Lista cartwall items' })
  getCartwall(@Param('storeId') storeId: string) {
    return this.announcementsService.getCartwallForStore(storeId);
  }
}
