import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, IsUrl, IsDateString, Min, Max, MinLength } from 'class-validator';
import { AnnouncementType } from '@prisma/client';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Benvenuto' })
  @IsString()
  @MinLength(2, { message: 'Il nome deve avere almeno 2 caratteri' })
  name: string;

  @ApiPropertyOptional({ enum: AnnouncementType, default: AnnouncementType.GENERIC })
  @IsEnum(AnnouncementType)
  @IsOptional()
  type?: AnnouncementType = AnnouncementType.GENERIC;

  @ApiPropertyOptional({ example: 'Benvenuti nel nostro negozio! Oggi troverete offerte speciali.' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/announcement.mp3' })
  @IsUrl()
  @IsOptional()
  audioUrl?: string;

  @ApiPropertyOptional({ example: 15, description: 'Durata in secondi' })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: 'rachel', description: 'ID voce ElevenLabs' })
  @IsString()
  @IsOptional()
  voiceId?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({ example: 1, minimum: 0, maximum: 10, description: 'Priorità (0-10)' })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  priority?: number = 0;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z', description: 'Valido da' })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z', description: 'Valido fino a' })
  @IsDateString()
  @IsOptional()
  validTo?: string;
}

export class UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {}

export class AddToCartwallDto {
  @ApiProperty({ example: 'announcement_abc123' })
  @IsString()
  announcementId: string;

  @ApiProperty({ example: 'store_xyz789' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 0, minimum: 0, maximum: 3, description: 'Posizione nel cartwall (0-3)' })
  @IsInt()
  @Min(0)
  @Max(3)
  position: number;
}

export class AnnouncementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: AnnouncementType })
  type: AnnouncementType;

  @ApiPropertyOptional()
  text?: string;

  @ApiPropertyOptional()
  audioUrl?: string;

  @ApiPropertyOptional()
  duration?: number;

  @ApiPropertyOptional()
  voiceId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  priority: number;

  @ApiPropertyOptional()
  validFrom?: Date;

  @ApiPropertyOptional()
  validTo?: Date;

  @ApiProperty()
  playCount: number;

  @ApiPropertyOptional()
  lastPlayedAt?: Date;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
