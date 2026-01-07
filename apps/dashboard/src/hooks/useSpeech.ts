import { useState, useRef, useCallback, useEffect } from 'react'
import { ElevenLabsClient, playAudioBlob } from '../services/api'

// Get API key from environment or localStorage (for demo)
const getElevenLabsApiKey = () => {
  return import.meta.env.VITE_ELEVENLABS_API_KEY || 
         localStorage.getItem('elevenlabs_api_key') || 
         ''
}

export interface Voice {
  id: string
  name: string
  gender: 'male' | 'female'
  provider: 'elevenlabs' | 'browser'
  preview?: string
}

// Available voices
export const VOICES: Voice[] = [
  // ElevenLabs voices
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Sofia', gender: 'female', provider: 'elevenlabs' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Marco', gender: 'male', provider: 'elevenlabs' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Elena', gender: 'female', provider: 'elevenlabs' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Luca', gender: 'male', provider: 'elevenlabs' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Chiara', gender: 'female', provider: 'elevenlabs' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Giuseppe', gender: 'male', provider: 'elevenlabs' },
  // Browser fallback
  { id: 'browser-it-female', name: 'Voce Sistema (F)', gender: 'female', provider: 'browser' },
  { id: 'browser-it-male', name: 'Voce Sistema (M)', gender: 'male', provider: 'browser' },
]

export interface UseSpeechOptions {
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const elevenLabsRef = useRef<ElevenLabsClient | null>(null)

  // Check for API key on mount
  useEffect(() => {
    const apiKey = getElevenLabsApiKey()
    if (apiKey) {
      elevenLabsRef.current = new ElevenLabsClient(apiKey)
      setHasApiKey(true)
    }
  }, [])

  // Set API key manually (for settings page)
  const setApiKey = useCallback((key: string) => {
    if (key) {
      localStorage.setItem('elevenlabs_api_key', key)
      elevenLabsRef.current = new ElevenLabsClient(key)
      setHasApiKey(true)
    } else {
      localStorage.removeItem('elevenlabs_api_key')
      elevenLabsRef.current = null
      setHasApiKey(false)
    }
  }, [])

  // Stop any playing audio
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (utteranceRef.current) {
      window.speechSynthesis.cancel()
      utteranceRef.current = null
    }
    setIsPlaying(false)
  }, [])

  // Generate and play speech using ElevenLabs
  const speakWithElevenLabs = useCallback(async (
    text: string,
    voiceId: string
  ): Promise<void> => {
    if (!elevenLabsRef.current) {
      throw new Error('ElevenLabs API key not configured')
    }

    setIsGenerating(true)
    setError(null)

    try {
      const blob = await elevenLabsRef.current.textToSpeech(text, voiceId, {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.3,
        speakerBoost: true,
      })

      const audio = playAudioBlob(blob)
      audioRef.current = audio

      audio.onplay = () => {
        setIsPlaying(true)
        options.onStart?.()
      }

      audio.onended = () => {
        setIsPlaying(false)
        audioRef.current = null
        options.onEnd?.()
      }

      audio.onerror = () => {
        setIsPlaying(false)
        setError('Errore riproduzione audio')
        options.onError?.(new Error('Audio playback error'))
      }

      await audio.play()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error.message)
      options.onError?.(error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }, [options])

  // Speak using browser's Web Speech API (fallback)
  const speakWithBrowser = useCallback((
    text: string,
    voiceId: string
  ): void => {
    stop()
    setError(null)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'it-IT'
    
    // Adjust based on voice selection
    if (voiceId.includes('male')) {
      utterance.pitch = 0.8
      utterance.rate = 0.9
    } else {
      utterance.pitch = 1.1
      utterance.rate = 0.9
    }

    // Try to find Italian voice
    const voices = window.speechSynthesis.getVoices()
    const italianVoice = voices.find(v => v.lang.startsWith('it'))
    if (italianVoice) {
      utterance.voice = italianVoice
    }

    utterance.onstart = () => {
      setIsPlaying(true)
      options.onStart?.()
    }

    utterance.onend = () => {
      setIsPlaying(false)
      utteranceRef.current = null
      options.onEnd?.()
    }

    utterance.onerror = (event) => {
      setIsPlaying(false)
      setError('Errore sintesi vocale')
      options.onError?.(new Error(event.error))
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [stop, options])

  // Main speak function - uses ElevenLabs if available, falls back to browser
  const speak = useCallback(async (
    text: string,
    voiceId?: string
  ): Promise<void> => {
    if (!text) return

    stop()

    // Find voice config
    const voice = VOICES.find(v => v.id === voiceId) || VOICES[0]

    // Use ElevenLabs if we have API key and it's not a browser voice
    if (hasApiKey && voice.provider === 'elevenlabs') {
      await speakWithElevenLabs(text, voice.id)
    } else {
      // Fallback to browser
      speakWithBrowser(text, voiceId || 'browser-it-female')
    }
  }, [hasApiKey, speakWithElevenLabs, speakWithBrowser, stop])

  // Toggle play/pause
  const toggle = useCallback(async (
    text: string,
    voiceId?: string
  ): Promise<void> => {
    if (isPlaying) {
      stop()
    } else {
      await speak(text, voiceId)
    }
  }, [isPlaying, speak, stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return {
    speak,
    stop,
    toggle,
    isPlaying,
    isGenerating,
    error,
    hasApiKey,
    setApiKey,
    voices: VOICES,
  }
}
