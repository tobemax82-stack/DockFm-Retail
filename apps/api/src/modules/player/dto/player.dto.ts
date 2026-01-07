import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsObject, IsBoolean, Min, Max } from 'class-validator';

export class PlayerHeartbeatDto {
  @ApiProperty({ example: 'store_abc123' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'device_xyz789' })
  @IsString()
  deviceId: string;

  @ApiPropertyOptional({ example: 70, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  volume?: number;

  @ApiPropertyOptional({ example: 'track_123' })
  @IsString()
  @IsOptional()
  currentTrackId?: string;

  @ApiPropertyOptional({ example: 120, description: 'Posizione in secondi' })
  @IsInt()
  @IsOptional()
  trackPosition?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPlaying?: boolean;

  @ApiPropertyOptional({ 
    example: { platform: 'linux', arch: 'arm64', version: '1.0.0' },
    description: 'Info sul dispositivo' 
  })
  @IsObject()
  @IsOptional()
  deviceInfo?: any;
}

export class TrackEventDto {
  @ApiProperty({ example: 'track_abc123' })
  @IsString()
  trackId: string;
}

export class AnnouncementEventDto {
  @ApiProperty({ example: 'announcement_xyz789' })
  @IsString()
  announcementId: string;
}

export class SyncStateDto {
  @ApiProperty({
    example: {
      volume: 70,
      isPlaying: true,
      currentTrackId: 'track_123',
      playlistId: 'playlist_456',
      position: 120,
    },
    description: 'Stato completo del player'
  })
  @IsObject()
  state: any;
}

export interface PlayerStateDto {
  store: {
    id: string;
    name: string;
    city?: string;
    timezone: string;
    currentVolume: number;
  };
  organization: {
    id: string;
    name: string;
    plan: string;
    settings?: any;
  };
  currentPlaylist: {
    id: string;
    name: string;
    tracks: any[];
  } | null;
  cartwall: Array<{
    position: number;
    announcement: any;
  }>;
  schedule: any[];
  settings: any;
}

export interface OfflineContentDto {
  store: {
    id: string;
    name: string;
  };
  audioFiles: Array<{
    type: 'track' | 'announcement';
    id: string;
    url: string;
  }>;
  playlists: any[];
  announcements: any[];
  schedule: any[];
  generatedAt: string;
}
