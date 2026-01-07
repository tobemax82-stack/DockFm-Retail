// API Service for DockFm Dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

// Types
export interface Voice {
  id: string
  name: string
  lang: string
  gender: 'male' | 'female'
}

export interface GenerateAnnouncementRequest {
  text: string
  voiceId?: string
  announcementType?: 'promo' | 'info' | 'safety' | 'custom'
  improveText?: boolean
}

export interface GenerateAnnouncementResponse {
  id: string
  status: 'completed' | 'processing' | 'failed'
  audioUrl?: string
  text: string
  duration?: number
  voiceId: string
}

export interface TextToSpeechRequest {
  text: string
  voiceId?: string
}

// API Client
class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    // Check if response is audio
    const contentType = response.headers.get('Content-Type')
    if (contentType?.includes('audio')) {
      return response.blob() as Promise<T>
    }

    return response.json()
  }

  // AI Endpoints
  async getVoices(): Promise<Voice[]> {
    return this.request<Voice[]>('/api/ai/voices')
  }

  async generateAnnouncement(data: GenerateAnnouncementRequest): Promise<GenerateAnnouncementResponse> {
    return this.request<GenerateAnnouncementResponse>('/api/ai/announcement', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async textToSpeech(data: TextToSpeechRequest): Promise<Blob> {
    return this.request<Blob>('/api/ai/tts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getGenerationStatus(id: string): Promise<GenerateAnnouncementResponse> {
    return this.request<GenerateAnnouncementResponse>(`/api/ai/generation/${id}`)
  }
}

export const api = new ApiClient(API_BASE_URL)

// Helper to play audio blob
export function playAudioBlob(blob: Blob): HTMLAudioElement {
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.onended = () => URL.revokeObjectURL(url)
  return audio
}

// ElevenLabs direct client (for demo without backend)
export class ElevenLabsClient {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'

  // Default Italian voices
  static VOICES = {
    RACHEL: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female' },
    ADAM: { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male' },
    BELLA: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female' },
    JOSH: { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male' },
    ARNOLD: { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male' },
    CHARLOTTE: { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female' },
    // Multilingual v2 voices (better Italian support)
    ARIA: { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'female' },
    ROGER: { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'male' },
  }

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async textToSpeech(
    text: string,
    voiceId: string = ElevenLabsClient.VOICES.ARIA.id,
    options: {
      stability?: number
      similarityBoost?: number
      style?: number
      speakerBoost?: boolean
    } = {}
  ): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: options.stability ?? 0.5,
            similarity_boost: options.similarityBoost ?? 0.75,
            style: options.style ?? 0.5,
            use_speaker_boost: options.speakerBoost ?? true,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail?.message || `ElevenLabs error: ${response.status}`)
    }

    return response.blob()
  }

  async getVoices(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch voices')
    }

    const data = await response.json()
    return data.voices
  }
}
