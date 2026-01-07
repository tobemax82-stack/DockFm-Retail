import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Mic2,
  Music,
  Wand2,
  Brain,
  Zap,
  MessageSquare,
  Volume2,
  Play,
  Pause,
  RefreshCw,
  Check,
  Copy,
  Download,
  Clock,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Target,
  Settings,
  ChevronRight,
  Loader2,
  FileAudio,
  ListMusic,
  Radio,
  Megaphone,
  Key,
} from 'lucide-react'
import { Card, Badge, Button, Input, cn } from '@dockfm/ui'
import { Header } from '../components/layout/Header'
import { useSpeech, VOICES } from '../hooks/useSpeech'

// AI capabilities
const aiCapabilities = [
  {
    id: 'voice',
    title: 'Generazione Vocale',
    description: 'Crea annunci vocali professionali da testo',
    icon: Mic2,
    color: 'brand',
    features: ['Voci multiple', 'Toni personalizzati', 'Multilingua'],
  },
  {
    id: 'playlist',
    title: 'Playlist Intelligenti',
    description: 'Playlist dinamiche basate su mood e contesto',
    icon: Music,
    color: 'accent',
    features: ['Mood detection', 'Auto-scheduling', 'Mix ottimale'],
  },
  {
    id: 'suggestions',
    title: 'Suggerimenti Smart',
    description: 'Ottimizzazioni automatiche basate sui dati',
    icon: Lightbulb,
    color: 'warning',
    features: ['Volume analysis', 'Best times', 'A/B testing'],
  },
  {
    id: 'analytics',
    title: 'Analisi Predittiva',
    description: 'Previsioni e insights avanzati',
    icon: Brain,
    color: 'success',
    features: ['Trend analysis', 'Engagement prediction', 'ROI forecast'],
  },
]

// AI suggestions mock data
const aiSuggestions = [
  {
    id: '1',
    type: 'volume',
    priority: 'high',
    title: 'Volume anomalo rilevato',
    description: 'Il negozio Bologna Centrale ha un volume del 85%, superiore alla media.',
    action: 'Ridurre a 70%',
    impact: '+15% comfort clienti',
  },
  {
    id: '2',
    type: 'playlist',
    priority: 'medium',
    title: 'Ottimizzazione playlist',
    description: 'La playlist "Morning Energy" performa meglio tra le 7:00 e le 9:00.',
    action: 'Estendere fascia oraria',
    impact: '+8% engagement',
  },
  {
    id: '3',
    type: 'announcement',
    priority: 'low',
    title: 'Nuovo annuncio suggerito',
    description: 'Basato sulle vendite, suggeriamo un annuncio per la categoria elettronica.',
    action: 'Genera annuncio',
    impact: '+12% vendite stimate',
  },
  {
    id: '4',
    type: 'schedule',
    priority: 'medium',
    title: 'Gap nella programmazione',
    description: 'Nessun annuncio programmato tra le 15:00 e le 17:00.',
    action: 'Aggiungi annuncio',
    impact: 'Copertura ottimale',
  },
]

// Voice generator component
const VoiceGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('')
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id)
  const [selectedTone, setSelectedTone] = useState('professional')
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  
  const { 
    speak, 
    stop, 
    toggle, 
    isPlaying, 
    isGenerating, 
    hasApiKey, 
    setApiKey,
    error 
  } = useSpeech()

  // Our display voices (map to ElevenLabs voices)
  const displayVoices = [
    { id: VOICES[0].id, name: 'Sofia', type: 'Professionale', gender: 'F' },
    { id: VOICES[1].id, name: 'Marco', type: 'Professionale', gender: 'M' },
    { id: VOICES[2].id, name: 'Elena', type: 'Caldo', gender: 'F' },
    { id: VOICES[3].id, name: 'Luca', type: 'Energetico', gender: 'M' },
  ]

  const handlePlayPause = () => {
    toggle(prompt, selectedVoice)
  }

  const handleGenerate = async () => {
    if (!prompt) return
    setGeneratedAudio('generated')
    // Start playing immediately
    await speak(prompt, selectedVoice)
  }

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput)
    setShowApiKeyInput(false)
    setApiKeyInput('')
  }

  const tones = [
    { id: 'professional', name: 'Professionale', emoji: '👔' },
    { id: 'friendly', name: 'Amichevole', emoji: '😊' },
    { id: 'urgent', name: 'Urgente', emoji: '⚡' },
    { id: 'calm', name: 'Calmo', emoji: '🧘' },
  ]

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-500/20">
            <Mic2 className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-surface-100">Generazione Vocale AI</h3>
            <p className="text-sm text-surface-400">
              {hasApiKey ? (
                <span className="text-success-400">✓ ElevenLabs connesso</span>
              ) : (
                'Usa Web Speech API (browser)'
              )}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          className={hasApiKey ? 'text-success-400' : 'text-surface-400'}
        >
          <Key className="w-4 h-4 mr-1.5" />
          {hasApiKey ? 'Configurato' : 'Configura API'}
        </Button>
      </div>

      {/* API Key Input */}
      {showApiKeyInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 rounded-xl bg-surface-800/30 border border-surface-700/50"
        >
          <label className="block text-sm font-medium text-surface-300 mb-2">
            ElevenLabs API Key
          </label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk_..."
              className="flex-1"
            />
            <Button onClick={handleSaveApiKey} disabled={!apiKeyInput}>
              Salva
            </Button>
          </div>
          <p className="text-xs text-surface-500 mt-2">
            Ottieni la tua API key su <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">elevenlabs.io</a>
          </p>
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-500/10 border border-error-500/30 text-error-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Text input */}
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Testo dell'annuncio
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Scrivi o incolla il testo del tuo annuncio..."
            className="w-full h-32 p-4 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500/50 resize-none"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-surface-500">{prompt.length} caratteri</span>
            <button className="text-xs text-brand-400 hover:text-brand-300">
              <Wand2 className="w-3 h-3 inline-block mr-1" />
              Genera con AI
            </button>
          </div>
        </div>

        {/* Voice selection */}
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Seleziona voce {hasApiKey && <Badge variant="secondary" size="sm" className="ml-2 bg-brand-500/20 text-brand-400">ElevenLabs</Badge>}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {displayVoices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={cn(
                  'p-3 rounded-xl border text-center transition-all',
                  selectedVoice === voice.id
                    ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                    : 'border-surface-700 text-surface-400 hover:bg-surface-800/50'
                )}
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-surface-800 flex items-center justify-center text-lg">
                  {voice.gender === 'F' ? '👩' : '👨'}
                </div>
                <p className="text-sm font-medium">{voice.name}</p>
                <p className="text-xs opacity-70">{voice.type}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tone selection */}
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Tono
          </label>
          <div className="flex gap-2">
            {tones.map((tone) => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={cn(
                  'flex-1 p-3 rounded-xl border transition-all',
                  selectedTone === tone.id
                    ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                    : 'border-surface-700 text-surface-400 hover:bg-surface-800/50'
                )}
              >
                <span className="text-xl">{tone.emoji}</span>
                <p className="text-sm mt-1">{tone.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {hasApiKey ? 'Generazione ElevenLabs...' : 'Elaborazione...'}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Genera e Riproduci
            </>
          )}
        </Button>

        {/* Generated audio preview */}
        {generatedAudio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/50"
          >
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handlePlayPause}
                disabled={isGenerating}
                className={cn(
                  "p-3 rounded-full text-white transition-colors",
                  isGenerating ? "bg-surface-600" : "bg-brand-500 hover:bg-brand-600"
                )}
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
              <div className="flex-1">
                <div className="h-12 rounded-lg bg-surface-800/50 flex items-center px-4">
                  <div className="flex items-center gap-0.5 h-8 w-full">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-brand-500/50 rounded-full"
                        animate={isPlaying ? { height: [8, Math.random() * 24 + 8, 8] } : { height: 8 }}
                        transition={{ duration: 0.3, repeat: isPlaying ? Infinity : 0, delay: i * 0.02 }}
                        style={{ height: 8 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm text-surface-400">0:15</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Rigenera
              </Button>
              <Button variant="secondary" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-1.5" />
                Scarica
              </Button>
              <Button size="sm" className="flex-1">
                <Check className="w-4 h-4 mr-1.5" />
                Usa
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  )
}

// Suggestions panel
const SuggestionsPanel: React.FC = () => {
  const priorityColors = {
    high: 'border-error-500/30 bg-error-500/5',
    medium: 'border-warning-500/30 bg-warning-500/5',
    low: 'border-brand-500/30 bg-brand-500/5',
  }

  const priorityBadges = {
    high: 'bg-error-500/20 text-error-400',
    medium: 'bg-warning-500/20 text-warning-400',
    low: 'bg-brand-500/20 text-brand-400',
  }

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-warning-500/20">
            <Lightbulb className="w-6 h-6 text-warning-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-surface-100">Suggerimenti AI</h3>
            <p className="text-sm text-surface-400">{aiSuggestions.length} ottimizzazioni disponibili</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          Vedi tutti
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {aiSuggestions.map((suggestion) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              'p-4 rounded-xl border transition-all hover:scale-[1.01]',
              priorityColors[suggestion.priority as keyof typeof priorityColors]
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  size="sm"
                  className={priorityBadges[suggestion.priority as keyof typeof priorityBadges]}
                >
                  {suggestion.priority === 'high' ? 'Alta' : suggestion.priority === 'medium' ? 'Media' : 'Bassa'}
                </Badge>
                <h4 className="font-medium text-surface-200">{suggestion.title}</h4>
              </div>
            </div>
            <p className="text-sm text-surface-400 mb-3">{suggestion.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-success-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {suggestion.impact}
              </span>
              <Button variant="secondary" size="sm">
                {suggestion.action}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}

// AI Activity Log
const ActivityLog: React.FC = () => {
  const activities = [
    { id: '1', action: 'Annuncio generato', target: 'Promo Weekend', time: '2 min fa', icon: Mic2 },
    { id: '2', action: 'Playlist ottimizzata', target: 'Morning Energy', time: '15 min fa', icon: Music },
    { id: '3', action: 'Volume regolato', target: 'Milano Centro', time: '1 ora fa', icon: Volume2 },
    { id: '4', action: 'Suggerimento applicato', target: 'Scheduling', time: '2 ore fa', icon: Lightbulb },
  ]

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-accent-500/20">
          <Zap className="w-6 h-6 text-accent-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-surface-100">Attività AI</h3>
          <p className="text-sm text-surface-400">Ultime azioni automatiche</p>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/30"
          >
            <div className="p-2 rounded-lg bg-surface-700/50">
              <activity.icon className="w-4 h-4 text-surface-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-surface-200">{activity.action}</p>
              <p className="text-xs text-surface-500">{activity.target}</p>
            </div>
            <span className="text-xs text-surface-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export const AIStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('voice')

  return (
    <>
      <Header
        title="AI Studio"
        subtitle="Il centro di controllo dell'intelligenza artificiale"
      />

      <div className="p-8">
        {/* Capabilities overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {aiCapabilities.map((cap) => (
            <button
              key={cap.id}
              onClick={() => setActiveTab(cap.id)}
              className={cn(
                'p-5 rounded-2xl border text-left transition-all',
                activeTab === cap.id
                  ? 'bg-brand-500/10 border-brand-500/30'
                  : 'bg-surface-900/50 border-surface-800/50 hover:bg-surface-800/50'
              )}
            >
              <div className={cn(
                'p-3 rounded-xl w-fit mb-3',
                cap.color === 'brand' && 'bg-brand-500/20 text-brand-400',
                cap.color === 'accent' && 'bg-accent-500/20 text-accent-400',
                cap.color === 'warning' && 'bg-warning-500/20 text-warning-400',
                cap.color === 'success' && 'bg-success-500/20 text-success-400',
              )}>
                <cap.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-surface-100 mb-1">{cap.title}</h3>
              <p className="text-sm text-surface-400 mb-3">{cap.description}</p>
              <div className="flex flex-wrap gap-1">
                {cap.features.map((feature) => (
                  <Badge key={feature} variant="secondary" size="sm">
                    {feature}
                  </Badge>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === 'voice' && (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <VoiceGenerator />
                </motion.div>
              )}
              {activeTab === 'suggestions' && (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SuggestionsPanel />
                </motion.div>
              )}
              {(activeTab === 'playlist' || activeTab === 'analytics') && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card variant="glass" className="p-12 text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-brand-400 opacity-50" />
                    <h3 className="text-xl font-semibold text-surface-100 mb-2">
                      Funzionalità in arrivo
                    </h3>
                    <p className="text-surface-400">
                      Stiamo lavorando a questa funzionalità. Disponibile presto!
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <SuggestionsPanel />
            <ActivityLog />
          </div>
        </div>
      </div>
    </>
  )
}
