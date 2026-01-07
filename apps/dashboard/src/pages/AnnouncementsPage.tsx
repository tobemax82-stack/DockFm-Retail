import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic2,
  Search,
  Plus,
  Play,
  Pause,
  Volume2,
  Clock,
  Store,
  Calendar,
  Sparkles,
  Wand2,
  Upload,
  FileAudio,
  Trash2,
  Edit,
  Copy,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  Repeat,
  Target,
  TrendingUp,
  Loader2,
  Key,
} from 'lucide-react'
import { Card, Badge, Button, Modal, Input, cn } from '@dockfm/ui'
import { useSpeech, VOICES } from '../hooks/useSpeech'
import { Header } from '../components/layout/Header'

// Mock data
const mockAnnouncements = [
  {
    id: '1',
    title: 'Promo Weekend -20%',
    content: 'Approfitta dello sconto del 20% su tutti gli articoli questo weekend. Offerta valida fino a domenica.',
    type: 'promo',
    status: 'active',
    voice: 'Professionale Femminile',
    duration: '15s',
    plays: 456,
    assignedStores: 12,
    schedule: {
      type: 'recurring',
      interval: 30,
      startTime: '09:00',
      endTime: '20:00',
    },
    createdAt: '2024-01-05',
    aiGenerated: true,
  },
  {
    id: '2',
    title: 'Chiusura Negozio',
    content: 'Gentili clienti, il negozio chiuderà tra 15 minuti. Vi invitiamo a recarvi alle casse.',
    type: 'info',
    status: 'scheduled',
    voice: 'Professionale Maschile',
    duration: '12s',
    plays: 24,
    assignedStores: 12,
    schedule: {
      type: 'fixed',
      times: ['19:45', '20:45'],
    },
    createdAt: '2024-01-04',
    aiGenerated: false,
  },
  {
    id: '3',
    title: 'Flash Sale Elettronica',
    content: 'Solo per oggi, sconto del 30% su tutti i prodotti di elettronica. Corri a scoprire le offerte!',
    type: 'promo',
    status: 'active',
    voice: 'Energetico Maschile',
    duration: '18s',
    plays: 234,
    assignedStores: 8,
    schedule: {
      type: 'recurring',
      interval: 45,
      startTime: '10:00',
      endTime: '18:00',
    },
    createdAt: '2024-01-06',
    aiGenerated: true,
  },
  {
    id: '4',
    title: 'Benvenuto',
    content: 'Benvenuti nel nostro negozio. Il nostro staff è a vostra disposizione per qualsiasi necessità.',
    type: 'info',
    status: 'paused',
    voice: 'Caldo Femminile',
    duration: '10s',
    plays: 1234,
    assignedStores: 12,
    schedule: {
      type: 'continuous',
    },
    createdAt: '2024-01-01',
    aiGenerated: false,
  },
  {
    id: '5',
    title: 'Nuova Collezione Primavera',
    content: 'Scopri la nuova collezione primavera-estate. Stile, eleganza e freschezza ti aspettano.',
    type: 'promo',
    status: 'draft',
    voice: 'Elegante Femminile',
    duration: '14s',
    plays: 0,
    assignedStores: 0,
    schedule: null,
    createdAt: '2024-01-06',
    aiGenerated: true,
  },
]

const typeColors: Record<string, string> = {
  promo: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
  info: 'bg-accent-500/20 text-accent-400 border-accent-500/30',
  alert: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
}

const statusColors: Record<string, string> = {
  active: 'bg-success-500/20 text-success-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  paused: 'bg-warning-500/20 text-warning-400',
  draft: 'bg-surface-700/50 text-surface-400',
}

const statusLabels: Record<string, string> = {
  active: 'Attivo',
  scheduled: 'Programmato',
  paused: 'In pausa',
  draft: 'Bozza',
}

const voiceOptions = [
  { id: 'prof-f', name: 'Professionale Femminile', preview: '🎙️' },
  { id: 'prof-m', name: 'Professionale Maschile', preview: '🎤' },
  { id: 'warm-f', name: 'Caldo Femminile', preview: '🎙️' },
  { id: 'energy-m', name: 'Energetico Maschile', preview: '🎤' },
  { id: 'elegant-f', name: 'Elegante Femminile', preview: '🎙️' },
]

interface AnnouncementCardProps {
  announcement: typeof mockAnnouncements[0]
  onEdit: () => void
  onPreview: () => void
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, onEdit, onPreview }) => {
  const { toggle, isPlaying, isGenerating, hasApiKey } = useSpeech()

  // Map announcement voice to our voice IDs
  const getVoiceId = (voiceName: string) => {
    if (voiceName.toLowerCase().includes('sofia')) return VOICES[0].id
    if (voiceName.toLowerCase().includes('marco')) return VOICES[1].id
    if (voiceName.toLowerCase().includes('elena')) return VOICES[2].id
    if (voiceName.toLowerCase().includes('luca')) return VOICES[3].id
    return VOICES[0].id // Default to Sofia
  }

  const handlePlayPause = () => {
    const voiceId = getVoiceId(announcement.voice)
    toggle(announcement.content, voiceId)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-surface-900/50 border border-surface-800/50 hover:bg-surface-800/30 transition-all"
    >
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2.5 rounded-xl',
            announcement.type === 'promo' ? 'bg-brand-500/20 text-brand-400' : 'bg-accent-500/20 text-accent-400'
          )}>
            <Mic2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-surface-100">{announcement.title}</h3>
              {announcement.aiGenerated && (
                <Sparkles className="w-4 h-4 text-brand-400" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" size="sm" className={statusColors[announcement.status]}>
                {statusLabels[announcement.status]}
              </Badge>
              <span className="text-xs text-surface-500">{announcement.duration}</span>
            </div>
          </div>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Content preview */}
      <p className="text-sm text-surface-400 mb-4 line-clamp-2">
        "{announcement.content}"
      </p>

      {/* Voice info */}
      <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-surface-800/30">
        <Volume2 className="w-4 h-4 text-surface-500" />
        <span className="text-sm text-surface-400">{announcement.voice}</span>
      </div>

      {/* Schedule info */}
      {announcement.schedule && (
        <div className="flex items-center gap-4 mb-4 text-sm text-surface-400">
          {announcement.schedule.type === 'recurring' && (
            <>
              <div className="flex items-center gap-1.5">
                <Repeat className="w-4 h-4" />
                <span>Ogni {announcement.schedule.interval} min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{announcement.schedule.startTime} - {announcement.schedule.endTime}</span>
              </div>
            </>
          )}
          {announcement.schedule.type === 'fixed' && (
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4" />
              <span>Orari: {announcement.schedule.times?.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 py-3 border-y border-surface-800/50">
        <div className="flex items-center gap-1.5 text-sm">
          <Play className="w-4 h-4 text-surface-500" />
          <span className="text-surface-300">{announcement.plays}</span>
          <span className="text-surface-500">plays</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Store className="w-4 h-4 text-surface-500" />
          <span className="text-surface-300">{announcement.assignedStores}</span>
          <span className="text-surface-500">negozi</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handlePlayPause}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Caricamento...
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-1.5" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1.5" />
              Ascolta {hasApiKey && <Sparkles className="w-3 h-3 ml-1 text-brand-400" />}
            </>
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}

// AI Generation Modal
interface AIGenerateModalProps {
  isOpen: boolean
  onClose: () => void
}

const AIGenerateModal: React.FC<AIGenerateModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    prompt: '',
    type: 'promo',
    voice: 'prof-f',
    tone: 'professional',
    duration: '15',
  })
  const [generatedContent, setGeneratedContent] = useState('')

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simula generazione AI
    await new Promise(resolve => setTimeout(resolve, 2000))
    setGeneratedContent(
      'Scopri le offerte imperdibili di questo weekend! Solo da noi, sconti fino al 30% su tutta la collezione. Non lasciarti sfuggire questa occasione unica. Ti aspettiamo!'
    )
    setIsGenerating(false)
    setStep(2)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Genera Annuncio con AI" size="lg">
      <div className="space-y-6">
        {step === 1 && (
          <>
            {/* Prompt input */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Descrivi l'annuncio che vuoi creare
              </label>
              <textarea
                placeholder="Es. Annuncio per promuovere i saldi del weekend con sconto del 30%, tono entusiasta ma professionale..."
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                className="w-full h-32 p-4 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500/50 resize-none"
              />
            </div>

            {/* Type selection */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Tipo di annuncio
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'promo', label: 'Promozionale', icon: Target },
                  { id: 'info', label: 'Informativo', icon: AlertCircle },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={cn(
                      'flex-1 p-4 rounded-xl border transition-all',
                      formData.type === type.id
                        ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                        : 'border-surface-700 text-surface-400 hover:bg-surface-800/50'
                    )}
                  >
                    <type.icon className="w-5 h-5 mx-auto mb-2" />
                    <p className="text-sm">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice selection */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Voce
              </label>
              <div className="grid grid-cols-2 gap-2">
                {voiceOptions.slice(0, 4).map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setFormData({ ...formData, voice: voice.id })}
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all',
                      formData.voice === voice.id
                        ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                        : 'border-surface-700 text-surface-400 hover:bg-surface-800/50'
                    )}
                  >
                    <span className="mr-2">{voice.preview}</span>
                    <span className="text-sm">{voice.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Durata target
              </label>
              <div className="flex gap-2">
                {['10', '15', '20', '30'].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setFormData({ ...formData, duration: dur })}
                    className={cn(
                      'px-4 py-2 rounded-lg border transition-all',
                      formData.duration === dur
                        ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                        : 'border-surface-700 text-surface-400 hover:bg-surface-800/50'
                    )}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={handleGenerate} disabled={!formData.prompt}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generazione in corso...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Genera Annuncio
                </>
              )}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Generated content */}
            <div className="p-6 rounded-xl bg-surface-800/30 border border-surface-700/50">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <span className="font-medium text-surface-200">Contenuto generato</span>
              </div>
              <p className="text-surface-300 leading-relaxed">
                "{generatedContent}"
              </p>
            </div>

            {/* Preview player */}
            <div className="p-4 rounded-xl bg-surface-900/50 border border-surface-800/50">
              <div className="flex items-center gap-4">
                <button className="p-3 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors">
                  <Play className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <div className="h-12 rounded-lg bg-surface-800/50 flex items-center px-4">
                    {/* Waveform placeholder */}
                    <div className="flex items-center gap-0.5 h-8">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-brand-500/50 rounded-full"
                          style={{ height: `${Math.random() * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-surface-400">0:15</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifica
              </Button>
              <Button variant="secondary" className="flex-1" onClick={handleGenerate}>
                <Wand2 className="w-4 h-4 mr-2" />
                Rigenera
              </Button>
              <Button className="flex-1" onClick={onClose}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Salva
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export const AnnouncementsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAIModal, setShowAIModal] = useState(false)

  const filteredAnnouncements = mockAnnouncements.filter((announcement) => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: mockAnnouncements.length,
    active: mockAnnouncements.filter(a => a.status === 'active').length,
    scheduled: mockAnnouncements.filter(a => a.status === 'scheduled').length,
    paused: mockAnnouncements.filter(a => a.status === 'paused').length,
    draft: mockAnnouncements.filter(a => a.status === 'draft').length,
  }

  return (
    <>
      <Header
        title="Annunci"
        subtitle={`${mockAnnouncements.length} annunci configurati`}
        action={{
          label: 'Nuovo Annuncio',
          icon: Plus,
          onClick: () => setShowAIModal(true),
        }}
      />

      <div className="p-8">
        {/* Quick stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { key: 'all', label: 'Tutti', icon: Mic2 },
            { key: 'active', label: 'Attivi', icon: CheckCircle2 },
            { key: 'scheduled', label: 'Programmati', icon: Calendar },
            { key: 'paused', label: 'In pausa', icon: Pause },
            { key: 'draft', label: 'Bozze', icon: Edit },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={cn(
                'p-4 rounded-xl border transition-all duration-200',
                statusFilter === filter.key
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                  : 'bg-surface-900/50 border-surface-800/50 text-surface-400 hover:bg-surface-800/50'
              )}
            >
              <filter.icon className="w-5 h-5 mx-auto mb-2" />
              <p className="text-2xl font-bold">{statusCounts[filter.key as keyof typeof statusCounts]}</p>
              <p className="text-sm">{filter.label}</p>
            </button>
          ))}
        </div>

        {/* AI Generate CTA */}
        <Card variant="gradient" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Genera annunci con AI
                </h3>
                <p className="text-white/70">
                  Descrivi cosa vuoi comunicare e l'AI creerà l'audio perfetto
                </p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setShowAIModal(true)}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Genera con AI
            </Button>
          </div>
        </Card>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
            <input
              type="text"
              placeholder="Cerca annunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500/50"
            />
          </div>
          <Button variant="secondary">
            <Upload className="w-4 h-4 mr-2" />
            Carica Audio
          </Button>
        </div>

        {/* Announcements grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onEdit={() => {}}
                onPreview={() => {}}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AIGenerateModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </>
  )
}
