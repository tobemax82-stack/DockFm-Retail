import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { PlaybackEventType } from '@prisma/client';

export class PlaybackLogDto {
  @ApiProperty({ example: 'store_abc123' })
  @IsString()
  storeId: string;

  @ApiPropertyOptional({ example: 'track_xyz789' })
  @IsString()
  @IsOptional()
  trackId?: string;

  @ApiPropertyOptional({ example: 'announcement_123' })
  @IsString()
  @IsOptional()
  announcementId?: string;

  @ApiProperty({ enum: PlaybackEventType, example: PlaybackEventType.TRACK_PLAYED })
  @IsEnum(PlaybackEventType)
  eventType: PlaybackEventType;

  @ApiPropertyOptional({ 
    example: { position: 120, volume: 70 },
    description: 'Metadati aggiuntivi' 
  })
  @IsObject()
  @IsOptional()
  metadata?: any;
}

export class DashboardOverviewDto {
  @ApiProperty()
  stores: {
    total: number;
    online: number;
    offline: number;
  };

  @ApiProperty()
  content: {
    playlists: number;
    announcements: number;
  };

  @ApiProperty()
  playbacks: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export class StoreStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  tracks: number;

  @ApiProperty()
  announcements: number;

  @ApiProperty()
  topTracks: Array<{
    track: {
      id: string;
      title: string;
      artist: string;
      duration: number;
    };
    playCount: number;
  }>;

  @ApiProperty()
  hourlyDistribution: number[];
}

export class TrendDataDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  count: number;
}

export class UptimeDto {
  @ApiProperty()
  activeDays: number;

  @ApiProperty()
  totalDays: number;

  @ApiProperty()
  uptimePercentage: number;
}
