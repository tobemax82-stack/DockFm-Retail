import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { PlaybackLogDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Overview dashboard' })
  @ApiResponse({ status: 200, description: 'Statistiche generali' })
  getDashboard(@CurrentUser('organizationId') orgId: string) {
    return this.analyticsService.getDashboardOverview(orgId);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Statistiche per negozio' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Data inizio (ISO)' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'Data fine (ISO)' })
  @ApiResponse({ status: 200, description: 'Statistiche negozio' })
  getStoreStats(
    @Param('storeId') storeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getStoreStats(
      storeId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('store/:storeId/top-tracks')
  @ApiOperation({ summary: 'Tracce più riprodotte in un negozio' })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Top tracks' })
  getTopTracks(
    @Param('storeId') storeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getTopTracks(
      storeId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
      limit || 10,
    );
  }

  @Get('store/:storeId/uptime')
  @ApiOperation({ summary: 'Uptime negozio' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  @ApiResponse({ status: 200, description: 'Statistiche uptime' })
  getStoreUptime(
    @Param('storeId') storeId: string,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getStoreUptime(storeId, days || 30);
  }

  @Get('top-announcements')
  @ApiOperation({ summary: 'Annunci più riprodotti' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Top announcements' })
  getTopAnnouncements(
    @CurrentUser('organizationId') orgId: string,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getTopAnnouncements(orgId, limit || 10);
  }

  @Get('trend')
  @ApiOperation({ summary: 'Trend riproduzione per periodo' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month'] })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Dati trend' })
  getTrend(
    @CurrentUser('organizationId') orgId: string,
    @Query('period') period?: 'day' | 'week' | 'month',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getStatsByPeriod(
      orgId,
      period || 'week',
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('activity')
  @ApiOperation({ summary: 'Attività recenti' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({ status: 200, description: 'Lista attività' })
  getRecentActivity(
    @CurrentUser('organizationId') orgId: string,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getRecentActivity(orgId, limit || 50);
  }

  @Post('playback')
  @ApiOperation({ summary: 'Registra evento di riproduzione' })
  @ApiResponse({ status: 201, description: 'Evento registrato' })
  logPlayback(@Body() dto: PlaybackLogDto) {
    return this.analyticsService.logPlayback(dto);
  }
}
