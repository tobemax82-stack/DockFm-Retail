import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, IsUrl, IsArray, Min, MinLength } from 'class-validator';
import { Mood, TrackSource } from '@prisma/client';

// Playlist DTOs
export class CreatePlaylistDto {
  @ApiProperty({ example: 'Musica Rilassante Mattina' })
  @IsString()
  @MinLength(2, { message: 'Il nome deve avere almeno 2 caratteri' })
  name: string;

  @ApiPropertyOptional({ example: 'Perfetta per le ore mattutine' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: Mood })
  @IsEnum(Mood)
  @IsOptional()
  mood?: Mood;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsUrl()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdatePlaylistDto extends PartialType(CreatePlaylistDto) {}

export class DuplicatePlaylistDto {
  @ApiPropertyOptional({ example: 'Musica Rilassante Mattina (copia)' })
  @IsString()
  @IsOptional()
  name?: string;
}

// Track DTOs
export class AddTrackDto {
  @ApiProperty({ example: 'Peaceful Morning' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({ example: 'Various Artists' })
  @IsString()
  @IsOptional()
  artist?: string;

  @ApiPropertyOptional({ example: 'Ambient Collection' })
  @IsString()
  @IsOptional()
  album?: string;

  @ApiPropertyOptional({ example: 'Ambient' })
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiProperty({ example: 180, description: 'Durata in secondi' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({ example: 'https://storage.example.com/track.mp3' })
  @IsUrl()
  fileUrl: string;

  @ApiPropertyOptional({ enum: TrackSource, default: TrackSource.ROYALTY_FREE })
  @IsEnum(TrackSource)
  @IsOptional()
  source?: TrackSource = TrackSource.ROYALTY_FREE;

  @ApiPropertyOptional({ example: { bpm: 90, key: 'C major' } })
  @IsOptional()
  metadata?: any;
}

export class UpdateTrackDto extends PartialType(AddTrackDto) {}

export class ReorderTracksDto {
  @ApiProperty({ 
    example: ['track_id_1', 'track_id_2', 'track_id_3'],
    description: 'Array di ID tracce nell\'ordine desiderato' 
  })
  @IsArray()
  @IsString({ each: true })
  trackIds: string[];
}

// Response DTOs
export class PlaylistResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: Mood })
  mood?: Mood;

  @ApiPropertyOptional()
  coverUrl?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  trackCount: number;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TrackResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  artist?: string;

  @ApiPropertyOptional()
  album?: string;

  @ApiPropertyOptional()
  genre?: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty({ enum: TrackSource })
  source: TrackSource;

  @ApiProperty()
  order: number;

  @ApiProperty()
  playlistId: string;

  @ApiProperty()
  createdAt: Date;
}
