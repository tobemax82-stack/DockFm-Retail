import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsObject, MinLength, Matches } from 'class-validator';
import { Plan, BusinessSector } from '@prisma/client';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Fashion Retail Italia' })
  @IsString()
  @MinLength(2, { message: 'Il nome deve avere almeno 2 caratteri' })
  name: string;

  @ApiPropertyOptional({ example: 'fashion-retail-italia' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9-]+$/, { message: 'Lo slug può contenere solo lettere minuscole, numeri e trattini' })
  slug?: string;

  @ApiPropertyOptional({ enum: Plan, default: Plan.STARTER })
  @IsEnum(Plan)
  @IsOptional()
  plan?: Plan = Plan.STARTER;

  @ApiPropertyOptional({ enum: BusinessSector })
  @IsEnum(BusinessSector)
  @IsOptional()
  sector?: BusinessSector;

  @ApiPropertyOptional({ example: { defaultVolume: 70, defaultMood: 'RELAXED' } })
  @IsObject()
  @IsOptional()
  settings?: any;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}

export class UpdateSettingsDto {
  @ApiProperty({ 
    example: { 
      defaultVolume: 70, 
      defaultMood: 'RELAXED',
      autoPlay: true,
      scheduleEnabled: true,
    } 
  })
  @IsObject()
  settings: any;
}

export class UpdatePlanDto {
  @ApiProperty({ enum: Plan })
  @IsEnum(Plan)
  plan: Plan;
}

export class OrganizationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ enum: Plan })
  plan: Plan;

  @ApiPropertyOptional({ enum: BusinessSector })
  sector?: BusinessSector;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  settings?: any;

  @ApiProperty()
  storeCount: number;

  @ApiProperty()
  userCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
