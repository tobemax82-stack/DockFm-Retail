import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, MinLength, IsObject, Matches } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'Negozio Milano Centro' })
  @IsString()
  @MinLength(2, { message: 'Il nome deve avere almeno 2 caratteri' })
  name: string;

  @ApiPropertyOptional({ example: 'Via Roma 123' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Milano' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'IT' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'Europe/Rome' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({ example: { openHour: '09:00', closeHour: '20:00' } })
  @IsObject()
  @IsOptional()
  settings?: any;
}

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}

export class ActivateStoreDto {
  @ApiProperty({ example: '123456', description: 'Codice a 6 cifre' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Il codice deve essere di 6 cifre' })
  activationCode: string;
}

export class SetPlaylistDto {
  @ApiProperty({ example: 'playlist_abc123' })
  @IsString()
  playlistId: string;
}

export class SetVolumeDto {
  @ApiProperty({ example: 70, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  volume: number;
}

export class StoreResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  country?: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isOnline: boolean;

  @ApiProperty()
  currentVolume: number;

  @ApiPropertyOptional()
  lastSeen?: Date;

  @ApiProperty()
  activationCode: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
