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
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto, UpdatePlaylistDto, AddTrackDto, ReorderTracksDto, UpdateTrackDto, DuplicatePlaylistDto } from './dto/playlists.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, Mood } from '@prisma/client';

@ApiTags('Playlist')
@ApiBearerAuth()
@Controller('playlists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista tutte le playlist' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'mood', required: false, enum: Mood })
  @ApiResponse({ status: 200, description: 'Lista playlist' })
  findAll(
    @CurrentUser('organizationId') orgId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('mood') mood?: Mood,
  ) {
    return this.playlistsService.findAll(orgId, page, limit, mood);
  }

  @Get('by-mood/:mood')
  @ApiOperation({ summary: 'Lista playlist per mood' })
  @ApiResponse({ status: 200, description: 'Lista playlist filtrate per mood' })
  getByMood(
    @Param('mood') mood: Mood,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.playlistsService.getByMood(orgId, mood);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dettaglio playlist' })
  @ApiResponse({ status: 200, description: 'Dettagli playlist con tracce' })
  @ApiResponse({ status: 404, description: 'Playlist non trovata' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.playlistsService.findOne(id, orgId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crea nuova playlist' })
  @ApiResponse({ status: 201, description: 'Playlist creata' })
  create(
    @Body() createPlaylistDto: CreatePlaylistDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.playlistsService.create(createPlaylistDto, orgId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Aggiorna playlist' })
  @ApiResponse({ status: 200, description: 'Playlist aggiornata' })
  update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.playlistsService.update(id, updatePlaylistDto, orgId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Elimina playlist' })
  @ApiResponse({ status: 200, description: 'Playlist eliminata' })
  @ApiResponse({ status: 409, description: 'Playlist in uso' })
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.playlistsService.delete(id, orgId);
  }

  @Post(':id/duplicate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Duplica playlist' })
  @ApiResponse({ status: 201, description: 'Playlist duplicata' })
  duplicate(
    @Param('id') id: string,
    @Body() duplicateDto: DuplicatePlaylistDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.playlistsService.duplicate(id, orgId, duplicateDto.name);
  }

  @Post(':id/tracks')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Aggiungi traccia alla playlist' })
  @ApiResponse({ status: 201, description: 'Traccia aggiunta' })
  addTrack(
    @Param('id') playlistId: string,
    @Body() addTrackDto: AddTrackDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.playlistsService.addTrack(playlistId, addTrackDto, orgId);
  }

  @Patch(':id/tracks/:trackId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Aggiorna traccia' })
  @ApiResponse({ status: 200, description: 'Traccia aggiornata' })
  updateTrack(
    @Param('id') playlistId: string,
    @Param('trackId') trackId: string,
    @Body() updateTrackDto: UpdateTrackDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.playlistsService.updateTrack(playlistId, trackId, updateTrackDto, orgId);
  }

  @Delete(':id/tracks/:trackId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Rimuovi traccia dalla playlist' })
  @ApiResponse({ status: 200, description: 'Traccia rimossa' })
  removeTrack(
    @Param('id') playlistId: string,
    @Param('trackId') trackId: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.playlistsService.removeTrack(playlistId, trackId, orgId);
  }

  @Patch(':id/tracks/reorder')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Riordina tracce' })
  @ApiResponse({ status: 200, description: 'Tracce riordinate' })
  reorderTracks(
    @Param('id') playlistId: string,
    @Body() reorderDto: ReorderTracksDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.playlistsService.reorderTracks(playlistId, reorderDto, orgId);
  }
}
