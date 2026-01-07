import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, IsArray, ValidateNested, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '@prisma/client';

export class CreateScheduleRuleDto {
  @ApiProperty({ example: 'store_abc123' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'playlist_xyz789' })
  @IsString()
  playlistId: string;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '09:00', description: 'Ora inizio (HH:mm)' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
    message: 'Formato ora non valido. Usa HH:mm' 
  })
  startTime: string;

  @ApiProperty({ example: '12:00', description: 'Ora fine (HH:mm)' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
    message: 'Formato ora non valido. Usa HH:mm' 
  })
  endTime: string;

  @ApiPropertyOptional({ example: 70, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  volume?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateScheduleRuleDto extends PartialType(CreateScheduleRuleDto) {}

export class CopyScheduleDto {
  @ApiProperty({ example: 'store_source123', description: 'ID negozio sorgente' })
  @IsString()
  sourceStoreId: string;

  @ApiProperty({ example: 'store_target456', description: 'ID negozio destinazione' })
  @IsString()
  targetStoreId: string;
}

export class BulkCreateDto {
  @ApiProperty({ example: 'store_abc123' })
  @IsString()
  storeId: string;

  @ApiProperty({ type: [CreateScheduleRuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleRuleDto)
  rules: CreateScheduleRuleDto[];
}

export class ScheduleRuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  playlistId: string;

  @ApiProperty({ enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiPropertyOptional()
  volume?: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
