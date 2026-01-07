import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@negozio.it' })
  @IsEmail({}, { message: 'Email non valida' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: 'Password deve essere almeno 8 caratteri' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'admin@negozio.it' })
  @IsEmail({}, { message: 'Email non valida' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: 'Password deve essere almeno 8 caratteri' })
  password: string;

  @ApiProperty({ example: 'Mario Rossi' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Caffetteria Milano' })
  @IsString()
  @MinLength(2)
  organizationName: string;

  @ApiPropertyOptional({ example: 'CAFE', enum: ['CAFE', 'BOUTIQUE', 'GYM', 'RESTAURANT', 'PHARMACY', 'SUPERMARKET', 'HOTEL', 'SPA', 'OTHER'] })
  @IsOptional()
  @IsString()
  sector?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
