import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  GenerateAnnouncementDto, 
  GenerateJingleDto, 
  GenerateMusicDto,
  TextToSpeechDto,
  AIGenerationResponse,
} from './dto/ai.dto';
import { AIGenerationType, AIProvider, GenerationStatus } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

// Voci disponibili (ElevenLabs)
export const AI_VOICES = {
  RACHEL: { id: 'rachel', name: 'Rachel', lang: 'it', gender: 'female' },
  ADAM: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Adam', lang: 'it', gender: 'male' },
  BELLA: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', lang: 'it', gender: 'female' },
  ELLI: { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', lang: 'it', gender: 'female' },
  JOSH: { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', lang: 'it', gender: 'male' },
  ARNOLD: { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', lang: 'it', gender: 'male' },
  CHARLOTTE: { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', lang: 'it', gender: 'female' },
};

@Injectable()
export class AIService {
  private elevenLabsApiKey: string;
  private elevenLabsBaseUrl = 'https://api.elevenlabs.io/v1';
  private openaiApiKey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService,
  ) {
    this.elevenLabsApiKey = this.configService.get<string>('ELEVENLABS_API_KEY') || '';
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  /**
   * Genera un annuncio vocale con AI
   */
  async generateAnnouncement(dto: GenerateAnnouncementDto, organizationId: string): Promise<AIGenerationResponse> {
    // Crea record di generazione
    const generation = await this.prisma.aIGeneration.create({
      data: {
        type: AIGenerationType.ANNOUNCEMENT,
        provider: AIProvider.ELEVENLABS,
        prompt: dto.text,
        parameters: {
          voiceId: dto.voiceId,
          type: dto.announcementType,
        },
        status: GenerationStatus.PROCESSING,
        organizationId,
      },
    });

    try {
      // 1. Se necessario, migliora il testo con GPT
      let finalText = dto.text;
      if (dto.improveText && this.openaiApiKey) {
        finalText = await this.improveTextWithGPT(dto.text, dto.announcementType);
      }

      // 2. Genera audio con ElevenLabs
      const audioBuffer = await this.textToSpeechElevenLabs(finalText, dto.voiceId || 'rachel');

      // 3. Salva l'audio (in produzione: upload su S3/CloudStorage)
      // Per ora simuliamo un URL
      const audioUrl = await this.saveAudioFile(audioBuffer, generation.id);

      // Calcola durata approssimativa (circa 150 parole/minuto)
      const wordCount = finalText.split(/\s+/).length;
      const duration = Math.ceil((wordCount / 150) * 60);

      // 4. Aggiorna il record di generazione
      await this.prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: GenerationStatus.COMPLETED,
          outputUrl: audioUrl,
          duration,
          completedAt: new Date(),
        },
      });

      return {
        id: generation.id,
        status: 'completed',
        audioUrl,
        text: finalText,
        duration,
        voiceId: dto.voiceId || 'rachel',
      };
    } catch (error) {
      // Aggiorna lo stato a fallito
      await this.prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: GenerationStatus.FAILED,
          error: error.message,
        },
      });

      throw new InternalServerErrorException(`Errore nella generazione: ${error.message}`);
    }
  }

  /**
   * Genera un jingle con AI (placeholder per integrazione Mubert/Suno)
   */
  async generateJingle(dto: GenerateJingleDto, organizationId: string): Promise<AIGenerationResponse> {
    const generation = await this.prisma.aIGeneration.create({
      data: {
        type: AIGenerationType.JINGLE,
        provider: AIProvider.SUNO, // O MUBERT
        prompt: dto.prompt,
        parameters: {
          mood: dto.mood,
          duration: dto.duration,
          style: dto.style,
        },
        status: GenerationStatus.PROCESSING,
        organizationId,
      },
    });

    try {
      // TODO: Integrazione reale con Suno/Mubert
      // Per ora restituiamo un placeholder
      
      // Simula elaborazione
      await new Promise(resolve => setTimeout(resolve, 2000));

      const audioUrl = `https://storage.dockfm.com/jingles/${generation.id}.mp3`;

      await this.prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: GenerationStatus.COMPLETED,
          outputUrl: audioUrl,
          duration: dto.duration || 10,
          completedAt: new Date(),
        },
      });

      return {
        id: generation.id,
        status: 'completed',
        audioUrl,
        duration: dto.duration || 10,
        prompt: dto.prompt,
      };
    } catch (error) {
      await this.prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: GenerationStatus.FAILED,
          error: error.message,
        },
      });

      throw new InternalServerErrorException(`Errore nella generazione jingle: ${error.message}`);
    }
  }

  /**
   * Genera musica royalty-free con AI
   */
  async generateMusic(dto: GenerateMusicDto, organizationId: string): Promise<AIGenerationResponse> {
    const generation = await this.prisma.aIGeneration.create({
      data: {
        type: AIGenerationType.MUSIC,
        provider: dto.provider || AIProvider.MUBERT,
        prompt: dto.prompt,
        parameters: {
          mood: dto.mood,
          duration: dto.duration,
          genre: dto.genre,
          intensity: dto.intensity,
        },
        status: GenerationStatus.PROCESSING,
        organizationId,
      },
    });

    try {
      // TODO: Integrazione reale con Mubert API
      // Per ora restituiamo un placeholder
      
      await new Promise(resolve => setTimeout(resolve, 3000));

      const audioUrl = `https://storage.dockfm.com/music/${generation.id}.mp3`;

      await this.prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: GenerationStatus.COMPLETED,
          outputUrl: audioUrl,
          duration: dto.duration || 180,
          completedAt: new Date(),
        },
      });

      return {
        id: generation.id,
        status: 'completed',
        audioUrl,
        duration: dto.duration || 180,
        prompt: dto.prompt,
      };
    } catch (error) {
      await this.prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: GenerationStatus.FAILED,
          error: error.message,
        },
      });

      throw new InternalServerErrorException(`Errore nella generazione musica: ${error.message}`);
    }
  }

  /**
   * Text-to-Speech con ElevenLabs
   */
  async textToSpeech(dto: TextToSpeechDto): Promise<Buffer> {
    return this.textToSpeechElevenLabs(dto.text, dto.voiceId);
  }

  /**
   * Ottieni lista voci disponibili
   */
  async getAvailableVoices() {
    // Se abbiamo API key, prendiamo le voci da ElevenLabs
    if (this.elevenLabsApiKey) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${this.elevenLabsBaseUrl}/voices`, {
            headers: {
              'xi-api-key': this.elevenLabsApiKey,
            },
          })
        );
        return response.data.voices;
      } catch (error) {
        console.error('Errore nel recupero voci ElevenLabs:', error);
      }
    }

    // Ritorna voci predefinite
    return Object.values(AI_VOICES);
  }

  /**
   * Ottieni stato generazione
   */
  async getGenerationStatus(id: string) {
    const generation = await this.prisma.aIGeneration.findUnique({
      where: { id },
    });

    if (!generation) {
      throw new BadRequestException('Generazione non trovata');
    }

    return {
      id: generation.id,
      status: generation.status,
      outputUrl: generation.outputUrl,
      duration: generation.duration,
      error: generation.error,
      createdAt: generation.createdAt,
      completedAt: generation.completedAt,
    };
  }

  /**
   * Storico generazioni per organizzazione
   */
  async getGenerationHistory(organizationId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [generations, total] = await Promise.all([
      this.prisma.aIGeneration.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.aIGeneration.count({ where: { organizationId } }),
    ]);

    return {
      data: generations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // === METODI PRIVATI ===

  private async textToSpeechElevenLabs(text: string, voiceId: string): Promise<Buffer> {
    if (!this.elevenLabsApiKey) {
      throw new BadRequestException('API Key ElevenLabs non configurata');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.elevenLabsBaseUrl}/text-to-speech/${voiceId}`,
          {
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true,
            },
          },
          {
            headers: {
              'Accept': 'audio/mpeg',
              'xi-api-key': this.elevenLabsApiKey,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
          }
        )
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Errore ElevenLabs TTS:', error.response?.data || error.message);
      throw new InternalServerErrorException('Errore nella sintesi vocale');
    }
  }

  private async improveTextWithGPT(text: string, type?: string): Promise<string> {
    if (!this.openaiApiKey) {
      return text;
    }

    try {
      const systemPrompt = `Sei un copywriter esperto per annunci audio in-store. 
Migliora il seguente testo mantenendolo conciso, chiaro e professionale.
Tipo annuncio: ${type || 'generico'}
Lingua: italiano
Regole: 
- Max 50 parole
- Tono amichevole ma professionale
- Evita ripetizioni
- Adatto alla lettura ad alta voce`;

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text },
            ],
            max_tokens: 150,
            temperature: 0.7,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.openaiApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      return response.data.choices[0]?.message?.content || text;
    } catch (error) {
      console.error('Errore OpenAI:', error);
      return text;
    }
  }

  private async saveAudioFile(buffer: Buffer, generationId: string): Promise<string> {
    // TODO: In produzione, upload su S3/Google Cloud Storage
    // Per ora restituiamo un URL simulato
    
    // Qui dovresti:
    // 1. Uploadare il buffer su cloud storage
    // 2. Restituire l'URL pubblico
    
    return `https://storage.dockfm.com/generations/${generationId}.mp3`;
  }
}
