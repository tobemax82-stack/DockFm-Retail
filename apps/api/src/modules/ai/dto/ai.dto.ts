import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min, Max, MinLength } from 'class-validator';
import { AnnouncementType, Mood, AIProvider } from '@prisma/client';

export class GenerateAnnouncementDto {
  @ApiProperty({ 
    example: 'Benvenuti nel nostro negozio! Oggi troverete offerte speciali su tutti i prodotti.',
    description: 'Testo da convertire in audio' 
  })
  @IsString()
  @MinLength(10, { message: 'Il testo deve avere almeno 10 caratteri' })
  text: string;

  @ApiPropertyOptional({ 
    example: 'rachel',
    description: 'ID della voce ElevenLabs da usare' 
  })
  @IsString()
  @IsOptional()
  voiceId?: string;

  @ApiPropertyOptional({ 
    enum: AnnouncementType,
    description: 'Tipo di annuncio per ottimizzare il tono' 
  })
  @IsEnum(AnnouncementType)
  @IsOptional()
  announcementType?: AnnouncementType;

  @ApiPropertyOptional({ 
    default: false,
    description: 'Migliora automaticamente il testo con GPT' 
  })
  @IsBoolean()
  @IsOptional()
  improveText?: boolean = false;
}

export class GenerateJingleDto {
  @ApiProperty({ 
    example: 'Jingle allegro e orecchiabile per negozio di abbigliamento giovane',
    description: 'Descrizione del jingle da generare' 
  })
  @IsString()
  @MinLength(10)
  prompt: string;

  @ApiPropertyOptional({ enum: Mood })
  @IsEnum(Mood)
  @IsOptional()
  mood?: Mood;

  @ApiPropertyOptional({ 
    example: 10,
    description: 'Durata in secondi (5-30)',
    minimum: 5,
    maximum: 30 
  })
  @IsInt()
  @Min(5)
  @Max(30)
  @IsOptional()
  duration?: number = 10;

  @ApiPropertyOptional({ example: 'pop' })
  @IsString()
  @IsOptional()
  style?: string;
}

export class GenerateMusicDto {
  @ApiProperty({ 
    example: 'Musica ambient rilassante per un negozio di cosmetici, atmosfera spa',
    description: 'Descrizione della musica da generare' 
  })
  @IsString()
  @MinLength(10)
  prompt: string;

  @ApiPropertyOptional({ enum: Mood })
  @IsEnum(Mood)
  @IsOptional()
  mood?: Mood;

  @ApiPropertyOptional({ 
    example: 180,
    description: 'Durata in secondi (30-300)',
    minimum: 30,
    maximum: 300 
  })
  @IsInt()
  @Min(30)
  @Max(300)
  @IsOptional()
  duration?: number = 180;

  @ApiPropertyOptional({ example: 'ambient' })
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiPropertyOptional({ 
    example: 'low',
    enum: ['low', 'medium', 'high'],
    description: 'Intensità/energia della musica' 
  })
  @IsString()
  @IsOptional()
  intensity?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ enum: AIProvider, default: AIProvider.MUBERT })
  @IsEnum(AIProvider)
  @IsOptional()
  provider?: AIProvider;
}

export class TextToSpeechDto {
  @ApiProperty({ example: 'Benvenuti nel nostro negozio!' })
  @IsString()
  @MinLength(2)
  text: string;

  @ApiPropertyOptional({ example: 'rachel', default: 'rachel' })
  @IsString()
  @IsOptional()
  voiceId?: string = 'rachel';
}

export interface AIGenerationResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  text?: string;
  duration?: number;
  voiceId?: string;
  prompt?: string;
  error?: string;
}

export class VoiceDto {
  @ApiProperty({ example: 'rachel' })
  id: string;

  @ApiProperty({ example: 'Rachel' })
  name: string;

  @ApiProperty({ example: 'it' })
  lang: string;

  @ApiProperty({ example: 'female' })
  gender: string;
}
