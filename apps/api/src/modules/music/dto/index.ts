// =====================================================
// DOCKFM RETAIL - MUSIC DTOs
// Data Transfer Objects for Music Catalog
// =====================================================

import { IsString, IsOptional, IsInt, IsEnum, IsUrl, IsBoolean, Min, Max, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// =====================================================
// ENUMS
// =====================================================

export enum MoodType {
  MORNING_ACOUSTIC = 'MORNING_ACOUSTIC',
  SOFT_JAZZ = 'SOFT_JAZZ',
  LOUNGE = 'LOUNGE',
  ENERGY = 'ENERGY',
  POP_HITS = 'POP_HITS',
  AMBIENT = 'AMBIENT',
  ITALIAN = 'ITALIAN',
  CHILL = 'CHILL',
  CUSTOM = 'CUSTOM',
}

export enum TrackSource {
  UPLOAD = 'UPLOAD',         // User uploaded
  ROYALTY_FREE = 'ROYALTY_FREE', // From our library
  JAMENDO = 'JAMENDO',       // Jamendo API
  PIXABAY = 'PIXABAY',       // Pixabay Music
  AI_GENERATED = 'AI_GENERATED', // AI generated
}

// =====================================================
// CREATE TRACK DTO
// =====================================================

export class CreateTrackDto {
  @ApiProperty({ description: 'Track title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Artist name' })
  @IsString()
  @IsOptional()
  artist?: string;

  @ApiPropertyOptional({ description: 'Album name' })
  @IsString()
  @IsOptional()
  album?: string;

  @ApiProperty({ description: 'Duration in seconds' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({ description: 'Audio file URL or path' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ enum: MoodType })
  @IsEnum(MoodType)
  @IsOptional()
  mood?: MoodType;

  @ApiPropertyOptional({ description: 'BPM (beats per minute)' })
  @IsInt()
  @IsOptional()
  @Min(40)
  @Max(220)
  bpm?: number;

  @ApiPropertyOptional({ description: 'Genre tags' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genres?: string[];

  @ApiPropertyOptional({ description: 'Energy level 1-10' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
  energy?: number;

  @ApiPropertyOptional({ enum: TrackSource })
  @IsEnum(TrackSource)
  @IsOptional()
  source?: TrackSource;

  @ApiPropertyOptional({ description: 'External ID from source' })
  @IsString()
  @IsOptional()
  externalId?: string;

  @ApiPropertyOptional({ description: 'License info' })
  @IsString()
  @IsOptional()
  license?: string;

  @ApiPropertyOptional({ description: 'Is AI generated' })
  @IsBoolean()
  @IsOptional()
  isAI?: boolean;

  @ApiPropertyOptional({ description: 'Waveform data JSON' })
  @IsString()
  @IsOptional()
  waveform?: string;

  @ApiPropertyOptional({ description: 'Cover art URL' })
  @IsUrl()
  @IsOptional()
  coverUrl?: string;
}

// =====================================================
// UPDATE TRACK DTO
// =====================================================

export class UpdateTrackDto {
  @ApiPropertyOptional({ description: 'Track title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Artist name' })
  @IsString()
  @IsOptional()
  artist?: string;

  @ApiPropertyOptional({ description: 'Album name' })
  @IsString()
  @IsOptional()
  album?: string;

  @ApiPropertyOptional({ enum: MoodType })
  @IsEnum(MoodType)
  @IsOptional()
  mood?: MoodType;

  @ApiPropertyOptional({ description: 'BPM' })
  @IsInt()
  @IsOptional()
  @Min(40)
  @Max(220)
  bpm?: number;

  @ApiPropertyOptional({ description: 'Genre tags' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genres?: string[];

  @ApiPropertyOptional({ description: 'Energy level' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
  energy?: number;

  @ApiPropertyOptional({ description: 'Cover art URL' })
  @IsUrl()
  @IsOptional()
  coverUrl?: string;
}

// =====================================================
// SEARCH TRACKS DTO
// =====================================================

export class SearchTracksDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({ enum: MoodType })
  @IsEnum(MoodType)
  @IsOptional()
  mood?: MoodType;

  @ApiPropertyOptional({ description: 'Genre filter' })
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiPropertyOptional({ description: 'Min BPM' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(40)
  minBpm?: number;

  @ApiPropertyOptional({ description: 'Max BPM' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Max(220)
  maxBpm?: number;

  @ApiPropertyOptional({ description: 'Min energy' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
  minEnergy?: number;

  @ApiPropertyOptional({ description: 'Max energy' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
  maxEnergy?: number;

  @ApiPropertyOptional({ description: 'Min duration (seconds)' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(0)
  minDuration?: number;

  @ApiPropertyOptional({ description: 'Max duration (seconds)' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  maxDuration?: number;

  @ApiPropertyOptional({ enum: TrackSource })
  @IsEnum(TrackSource)
  @IsOptional()
  source?: TrackSource;

  @ApiPropertyOptional({ description: 'Page number' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// =====================================================
// STREAMING CONFIG DTO
// =====================================================

export class StreamingConfigDto {
  @ApiPropertyOptional({ description: 'Audio format' })
  @IsString()
  @IsOptional()
  format?: 'mp3' | 'aac' | 'opus' = 'aac';

  @ApiPropertyOptional({ description: 'Bitrate in kbps' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  bitrate?: number = 128;

  @ApiPropertyOptional({ description: 'Sample rate' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  sampleRate?: number = 44100;

  @ApiPropertyOptional({ description: 'Normalize loudness to target LUFS' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(-24)
  @Max(-8)
  targetLufs?: number = -14;

  @ApiPropertyOptional({ description: 'Enable crossfade' })
  @IsBoolean()
  @IsOptional()
  crossfade?: boolean = true;

  @ApiPropertyOptional({ description: 'Crossfade duration (ms)' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(12000)
  crossfadeDuration?: number = 3000;
}

// =====================================================
// RESPONSE DTOs
// =====================================================

export class TrackResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  artist?: string;

  @ApiProperty()
  album?: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  streamUrl?: string;

  @ApiProperty({ enum: MoodType })
  mood?: MoodType;

  @ApiProperty()
  bpm?: number;

  @ApiProperty()
  genres?: string[];

  @ApiProperty()
  energy?: number;

  @ApiProperty({ enum: TrackSource })
  source?: TrackSource;

  @ApiProperty()
  coverUrl?: string;

  @ApiProperty()
  isAI: boolean;

  @ApiProperty()
  waveform?: number[];

  @ApiProperty()
  createdAt: Date;
}

export class PaginatedTracksResponseDto {
  @ApiProperty({ type: [TrackResponseDto] })
  items: TrackResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class StreamTokenResponseDto {
  @ApiProperty({ description: 'JWT token for streaming' })
  token: string;

  @ApiProperty({ description: 'Streaming URL' })
  streamUrl: string;

  @ApiProperty({ description: 'Token expiration' })
  expiresAt: Date;
}
