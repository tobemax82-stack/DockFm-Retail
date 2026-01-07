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
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto, ActivateStoreDto, SetPlaylistDto, SetVolumeDto } from './dto/stores.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Negozi')
@ApiBearerAuth()
@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @ApiOperation({ summary: 'Lista tutti i negozi dell\'organizzazione' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista negozi' })
  findAll(
    @CurrentUser('organizationId') orgId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.storesService.findAll(orgId, page, limit, search);
  }

  @Get('online')
  @ApiOperation({ summary: 'Lista negozi online' })
  @ApiResponse({ status: 200, description: 'Lista negozi online' })
  getOnlineStores(@CurrentUser('organizationId') orgId: string) {
    return this.storesService.getOnlineStores(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dettaglio negozio' })
  @ApiResponse({ status: 200, description: 'Dettagli negozio' })
  @ApiResponse({ status: 404, description: 'Negozio non trovato' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.storesService.findOne(id, orgId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crea nuovo negozio' })
  @ApiResponse({ status: 201, description: 'Negozio creato' })
  create(
    @Body() createStoreDto: CreateStoreDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.storesService.create(createStoreDto, orgId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER)
  @ApiOperation({ summary: 'Aggiorna negozio' })
  @ApiResponse({ status: 200, description: 'Negozio aggiornato' })
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.storesService.update(id, updateStoreDto, orgId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Disattiva negozio' })
  @ApiResponse({ status: 200, description: 'Negozio disattivato' })
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.storesService.delete(id, orgId);
  }

  @Post('activate')
  @Public()
  @ApiOperation({ summary: 'Attiva player con codice di attivazione' })
  @ApiResponse({ status: 200, description: 'Player attivato' })
  @ApiResponse({ status: 404, description: 'Codice non valido' })
  activate(@Body() activateDto: ActivateStoreDto) {
    return this.storesService.activate(activateDto);
  }

  @Post(':id/regenerate-code')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Rigenera codice di attivazione' })
  @ApiResponse({ status: 200, description: 'Codice rigenerato' })
  regenerateCode(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.storesService.regenerateActivationCode(id, orgId);
  }

  @Patch(':id/playlist')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER)
  @ApiOperation({ summary: 'Imposta playlist attiva' })
  @ApiResponse({ status: 200, description: 'Playlist impostata' })
  setPlaylist(
    @Param('id') id: string,
    @Body() setPlaylistDto: SetPlaylistDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.storesService.setActivePlaylist(id, setPlaylistDto.playlistId, orgId);
  }

  @Patch(':id/volume')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER)
  @ApiOperation({ summary: 'Imposta volume' })
  @ApiResponse({ status: 200, description: 'Volume impostato' })
  setVolume(
    @Param('id') id: string,
    @Body() setVolumeDto: SetVolumeDto,
  ) {
    return this.storesService.setVolume(id, setVolumeDto.volume);
  }
}
