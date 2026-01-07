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
import { SchedulerService } from './scheduler.service';
import { CreateScheduleRuleDto, UpdateScheduleRuleDto, CopyScheduleDto, BulkCreateDto } from './dto/scheduler.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, DayOfWeek } from '@prisma/client';

@ApiTags('Scheduler - Programmazione')
@ApiBearerAuth()
@Controller('scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Lista regole di programmazione per negozio' })
  @ApiResponse({ status: 200, description: 'Lista regole' })
  findAllForStore(
    @Param('storeId') storeId: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.schedulerService.findAllForStore(storeId, orgId);
  }

  @Get('store/:storeId/weekly')
  @ApiOperation({ summary: 'Vista settimanale della programmazione' })
  @ApiResponse({ status: 200, description: 'Programmazione settimanale' })
  getWeeklyOverview(
    @Param('storeId') storeId: string,
  ) {
    return this.schedulerService.getWeeklyOverview(storeId);
  }

  @Get('store/:storeId/day/:day')
  @ApiOperation({ summary: 'Programmazione per un giorno specifico' })
  @ApiResponse({ status: 200, description: 'Regole del giorno' })
  getScheduleForDay(
    @Param('storeId') storeId: string,
    @Param('day') day: DayOfWeek,
  ) {
    return this.schedulerService.getScheduleForDay(storeId, day);
  }

  @Get('store/:storeId/current')
  @ApiOperation({ summary: 'Playlist attualmente in programmazione' })
  @ApiResponse({ status: 200, description: 'Playlist corrente o null' })
  getCurrentPlaylist(@Param('storeId') storeId: string) {
    return this.schedulerService.getCurrentPlaylist(storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dettaglio regola' })
  @ApiResponse({ status: 200, description: 'Dettagli regola' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.schedulerService.findOne(id, orgId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crea nuova regola di programmazione' })
  @ApiResponse({ status: 201, description: 'Regola creata' })
  create(
    @Body() createDto: CreateScheduleRuleDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.schedulerService.create(createDto, orgId);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crea multiple regole in una volta' })
  @ApiResponse({ status: 201, description: 'Regole create' })
  bulkCreate(
    @Body() bulkDto: BulkCreateDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.schedulerService.bulkCreate(bulkDto.storeId, bulkDto.rules, orgId);
  }

  @Post('copy')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Copia programmazione da un negozio ad un altro' })
  @ApiResponse({ status: 201, description: 'Programmazione copiata' })
  copySchedule(
    @Body() copyDto: CopyScheduleDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.schedulerService.copySchedule(copyDto.sourceStoreId, copyDto.targetStoreId, orgId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Aggiorna regola' })
  @ApiResponse({ status: 200, description: 'Regola aggiornata' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateScheduleRuleDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.schedulerService.update(id, updateDto, orgId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Elimina regola' })
  @ApiResponse({ status: 200, description: 'Regola eliminata' })
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.schedulerService.delete(id, orgId);
  }
}
