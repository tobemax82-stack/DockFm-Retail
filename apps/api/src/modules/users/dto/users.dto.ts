import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'mario.rossi@esempio.it' })
  @IsEmail({}, { message: 'Email non valida' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'La password deve avere almeno 8 caratteri' })
  password: string;

  @ApiPropertyOptional({ example: 'Mario' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Rossi' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.STORE_MANAGER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.STORE_MANAGER;

  @ApiPropertyOptional({ example: 'org_123' })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  organizationId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
