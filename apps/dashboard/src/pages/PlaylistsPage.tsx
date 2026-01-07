import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music,
  Search,
  Plus,
  Play,
  Pause,
  MoreVertical,
  Clock,
  Users,
  Heart,
  Shuffle,
  Repeat,
  SkipBack,
  SkipForward,
  Volume2,
  ListMusic,
  Sparkles,
  Calendar,
  Store,
  Edit,
  Trash2,
  Copy,
  ChevronRight,
  GripVertical,
} from 'lucide-react'
import { Card, Badge, Button, Modal, Input, cn } from '@dockfm/ui'
import { Header } from '../components/layout/Header'

// Mock data
const mockPlaylists = [
  {
    id: '1',
    name: 'Morning Energy',
    description: 'Energia positiva per iniziare la giornata',
    cover: '🌅',
    trackCount: 45,
    duration: '2h 34m',
    mood: 'energetic',
    assignedStores: 8,
    plays: 1234,
    isActive: true,
    schedule: '06:00 - 10:00',
    tracks: [
      { id: '1', title: 'Good Morning', artist: 'Norah Jones', duration: '3:45' },
      { id: '2', title: 'Here Comes The Sun', artist: 'The Beatles', duration: '3:05' },
      { id: '3', title: 'Walking on Sunshine', artist: 'Katrina & The Waves', duration: '3:58' },
    ]
  },
  {
    id: '2',
    name: 'Chill Afternoon',
    description: 'Musica rilassante per il pomeriggio',
    cover: '☀️',
    trackCount: 62,
    duration: '3h 12m',
    mood: 'relaxed',
    assignedStores: 12,
    plays: 2456,
    isActive: true,
    schedule: '14:00 - 18:00',
    tracks: [
      { id: '1', title: 'Weightless', artist: 'Marconi Union', duration: '8:09' },
      { id: '2', title: 'Sunset Lover', artist: 'Petit Biscuit', duration: '3:29' },
    ]
  },
  {
    id: '3',
    name: 'Evening Jazz',
    description: 'Jazz sofisticato per la sera',
    cover: '🎷',
    trackCount: 38,
    duration: '2h 48m',
    mood: 'sophisticated',
    assignedStores: 6,
    plays: 987,
    isActive: true,
    schedule: '18:00 - 21:00',
    tracks: [
      { id: '1', title: 'Take Five', artist: 'Dave Brubeck', duration: '5:24' },
      { id: '2', title: 'So What', artist: 'Miles Davis', duration: '9:22' },
    ]
  },
  {
    id: '4',
    name: 'Pop Hits 2024',
    description: 'Le hit del momento',
    cover: '🎵',
    trackCount: 50,
    duration: '2h 55m',
    mood: 'upbeat',
    assignedStores: 10,
    plays: 3421,
    isActive: false,
    schedule: 'Non programmata',
    tracks: []
  },
  {
    id: '5',
    name: 'Acoustic Sessions',
    description: 'Cover acustiche e unplugged',
    cover: '🎸',
    trackCount: 42,
    duration: '2h 20m',
    mood: 'intimate',
    assignedStores: 4,
    plays: 756,
    isActive: true,
    schedule: '10:00 - 14:00',
    tracks: []
  },
  {
    id: '6',
    name: 'Lounge & Chillout',
    description: 'Atmosfere lounge per ambienti eleganti',
    cover: '🍸',
    trackCount: 55,
    duration: '3h 45m',
    mood: 'lounge',
    assignedStores: 5,
    plays: 1543,
    isActive: true,
    schedule: '21:00 - 23:00',
    tracks: []
  },
]

const moodColors: Record<string, string> = {
  energetic: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  relaxed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  sophisticated: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  upbeat: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  intimate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  lounge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

const moodLabels: Record<string, string> = {
  energetic: 'Energetico',
  relaxed: 'Rilassato',
  sophisticated: 'Sofisticato',
  upbeat: 'Allegro',
  intimate: 'Intimo',
  lounge: 'Lounge',
}

interface PlaylistCardProps {
  playlist: typeof mockPlaylists[0]
  onSelect: () => void
  isSelected: boolean
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onSelect, isSelected }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative p-4 rounded-2xl border cursor-pointer transition-all duration-200',
        isSelected
          ? 'bg-brand-500/10 border-brand-500/30 ring-2 ring-brand-500/20'
          : 'bg-surface-900/50 border-surface-800/50 hover:bg-surface-800/50 hover:border-surface-700/50'
      )}
      onClick={onSelect}
    >
      {/* Cover and info */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-surface-800 flex items-center justify-center text-3xl">
          {playlist.cover}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-surface-100 truncate">{playlist.name}</h3>
            {playlist.isActive && (
              <span className="w-2 h-2 rounded-full bg-success-500" />
            )}
          </div>
          <p className="text-sm text-surface-400 truncate">{playlist.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" size="sm" className={moodColors[playlist.mood]}>
              {moodLabels[playlist.mood]}
            </Badge>
            <span className="text-xs text-surface-500">
              {playlist.trackCount} brani • {playlist.duration}
            </span>
          </div>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-800/50">
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <Store className="w-3.5 h-3.5" />
          <span>{playlist.assignedStores} negozi</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <Play className="w-3.5 h-3.5" />
          <span>{playlist.plays.toLocaleString()} plays</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{playlist.schedule}</span>
        </div>
      </div>
    </motion.div>
  )
}

// Player preview component
interface PlaylistPreviewProps {
  playlist: typeof mockPlaylists[0] | null
  onClose: () => void
}

const PlaylistPreview: React.FC<PlaylistPreviewProps> = ({ playlist, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!playlist) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-96 bg-surface-900/80 backdrop-blur-xl border border-surface-800/50 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-brand-500/20 to-accent-500/10">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" size="sm" className={moodColors[playlist.mood]}>
            {moodLabels[playlist.mood]}
          </Badge>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-200">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="w-20 h-20 rounded-2xl bg-surface-800/50 flex items-center justify-center text-4xl mb-4">
          {playlist.cover}
        </div>
        <h2 className="text-xl font-bold text-surface-100">{playlist.name}</h2>
        <p className="text-sm text-surface-400 mt-1">{playlist.description}</p>
        <div className="flex items-center gap-4 mt-4 text-sm text-surface-400">
          <span>{playlist.trackCount} brani</span>
          <span>•</span>
          <span>{playlist.duration}</span>
        </div>
      </div>

      {/* Mini player */}
      <div className="p-4 border-b border-surface-800/50">
        <div className="flex items-center justify-center gap-4">
          <button className="p-2 text-surface-400 hover:text-surface-200">
            <Shuffle className="w-4 h-4" />
          </button>
          <button className="p-2 text-surface-400 hover:text-surface-200">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button className="p-2 text-surface-400 hover:text-surface-200">
            <SkipForward className="w-5 h-5" />
          </button>
          <button className="p-2 text-surface-400 hover:text-surface-200">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Track list */}
      <div className="p-4 max-h-64 overflow-y-auto">
        <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">
          Tracklist
        </h3>
        <div className="space-y-1">
          {playlist.tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-800/50 cursor-pointer group"
            >
              <span className="w-5 text-xs text-surface-500 text-center group-hover:hidden">
                {index + 1}
              </span>
              <Play className="w-4 h-4 text-surface-400 hidden group-hover:block" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-surface-200 truncate">{track.title}</p>
                <p className="text-xs text-surface-500 truncate">{track.artist}</p>
              </div>
              <span className="text-xs text-surface-500">{track.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-surface-800/50">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm">
            <Edit className="w-4 h-4 mr-1.5" />
            Modifica
          </Button>
          <Button variant="secondary" size="sm">
            <Store className="w-4 h-4 mr-1.5" />
            Assegna
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// New playlist modal
interface NewPlaylistModalProps {
  isOpen: boolean
  onClose: () => void
}

const NewPlaylistModal: React.FC<NewPlaylistModalProps> = ({ isOpen, onClose }) => {
  const [useAI, setUseAI] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mood: 'relaxed',
    prompt: '',
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuova Playlist" size="lg">
      <div className="space-y-6">
        {/* Toggle AI */}
        <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-surface-800/30">
          <button
            onClick={() => setUseAI(false)}
            className={cn(
              'flex-1 p-4 rounded-xl border transition-all',
              !useAI
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                : 'border-surface-700 text-surface-400 hover:bg-surface-800/50'
            )}
          >
            <ListMusic className="w-6 h-6 mx-auto mb-2" />
            <p className="font-medium">Manuale</p>
            <p className="text-xs mt-1 opacity-70">Seleziona i brani</p>
          </button>
          <button
            onClick={() => setUseAI(true)}
            className={cn(
              'flex-1 p-4 rounded-xl border transition-all',
              useAI
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                : 'border-surface-700 text-surface-400 hover:bg-surface-800/50'
            )}
          >
            <Sparkles className="w-6 h-6 mx-auto mb-2" />
            <p className="font-medium">AI Generated</p>
            <p className="text-xs mt-1 opacity-70">Descrivi il mood</p>
          </button>
        </div>

        {useAI ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Descrivi la playlist che vuoi
              </label>
              <textarea
                placeholder="Es. Musica rilassante per un negozio di abbigliamento elegante, target 25-45 anni, atmosfera sofisticata ma non troppo formale..."
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                className="w-full h-32 p-4 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500/50 resize-none"
              />
            </div>
            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
              <div className="flex items-center gap-2 text-brand-400 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">AI genera automaticamente</span>
              </div>
              <ul className="text-sm text-surface-400 space-y-1">
                <li>• Nome e descrizione ottimizzati</li>
                <li>• Selezione brani basata sul mood</li>
                <li>• Mix equilibrato di generi</li>
                <li>• Durata ottimale 2-3 ore</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Nome Playlist
              </label>
              <Input
                placeholder="Es. Morning Vibes"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Descrizione
              </label>
              <Input
                placeholder="Breve descrizione della playlist"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Mood
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(moodLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFormData({ ...formData, mood: key })}
                    className={cn(
                      'p-3 rounded-xl border text-sm transition-all',
                      formData.mood === key
                        ? moodColors[key]
                        : 'border-surface-700 text-surface-400 hover:bg-surface-800/50'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-800/50">
          <Button variant="ghost" onClick={onClose}>Annulla</Button>
          <Button>
            {useAI ? (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Genera con AI
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" />
                Crea Playlist
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export const PlaylistsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState<typeof mockPlaylists[0] | null>(null)
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredPlaylists = mockPlaylists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Header
        title="Playlist"
        subtitle={`${mockPlaylists.length} playlist disponibili`}
        action={{
          label: 'Nuova Playlist',
          icon: Plus,
          onClick: () => setShowNewPlaylistModal(true),
        }}
      />

      <div className="p-8">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1">
            {/* Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                <input
                  type="text"
                  placeholder="Cerca playlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500/50"
                />
              </div>
              <Button variant="secondary">
                <Sparkles className="w-4 h-4 mr-2" />
                Suggerisci AI
              </Button>
            </div>

            {/* Playlists grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredPlaylists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    isSelected={selectedPlaylist?.id === playlist.id}
                    onSelect={() => setSelectedPlaylist(
                      selectedPlaylist?.id === playlist.id ? null : playlist
                    )}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Preview panel */}
          <AnimatePresence>
            {selectedPlaylist && (
              <PlaylistPreview
                playlist={selectedPlaylist}
                onClose={() => setSelectedPlaylist(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <NewPlaylistModal
        isOpen={showNewPlaylistModal}
        onClose={() => setShowNewPlaylistModal(false)}
      />
    </>
  )
}
