import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store,
  Search,
  Plus,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  MoreVertical,
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw,
  Power,
  Music,
  Mic2,
  ChevronDown,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { Card, Badge, Button, Input, Modal, cn } from '@dockfm/ui'
import { Header } from '../components/layout/Header'

// Mock data - in produzione verrebbe da API
const mockStores = [
  {
    id: '1',
    name: 'Milano Centro',
    address: 'Via Torino 15, Milano',
    status: 'online' as const,
    isPlaying: true,
    currentTrack: 'Lounge Vibes - Chill Mix',
    currentPlaylist: 'Chill Afternoon',
    volume: 65,
    lastSync: '2 min fa',
    todayPlays: 234,
    todayAnnouncements: 18,
    uptime: '99.8%',
  },
  {
    id: '2',
    name: 'Roma Termini',
    address: 'Via Giolitti 34, Roma',
    status: 'online' as const,
    isPlaying: true,
    currentTrack: 'Jazz Cafe Essentials',
    currentPlaylist: 'Morning Jazz',
    volume: 70,
    lastSync: '1 min fa',
    todayPlays: 189,
    todayAnnouncements: 15,
    uptime: '99.5%',
  },
  {
    id: '3',
    name: 'Torino Porta Nuova',
    address: 'Corso Vittorio 89, Torino',
    status: 'offline' as const,
    isPlaying: false,
    currentTrack: '-',
    currentPlaylist: '-',
    volume: 0,
    lastSync: '3 ore fa',
    todayPlays: 45,
    todayAnnouncements: 3,
    uptime: '87.2%',
  },
  {
    id: '4',
    name: 'Firenze SMN',
    address: 'Piazza Stazione 12, Firenze',
    status: 'online' as const,
    isPlaying: true,
    currentTrack: 'Acoustic Morning',
    currentPlaylist: 'Acoustic Hits',
    volume: 55,
    lastSync: '30 sec fa',
    todayPlays: 312,
    todayAnnouncements: 22,
    uptime: '99.9%',
  },
  {
    id: '5',
    name: 'Bologna Centrale',
    address: 'Via Indipendenza 44, Bologna',
    status: 'warning' as const,
    isPlaying: true,
    currentTrack: 'Pop Hits 2024',
    currentPlaylist: 'Pop Energy',
    volume: 85,
    lastSync: '5 min fa',
    todayPlays: 156,
    todayAnnouncements: 12,
    uptime: '95.3%',
  },
  {
    id: '6',
    name: 'Napoli Centrale',
    address: 'Piazza Garibaldi 1, Napoli',
    status: 'online' as const,
    isPlaying: false,
    currentTrack: '-',
    currentPlaylist: 'Evening Relax',
    volume: 60,
    lastSync: '1 min fa',
    todayPlays: 198,
    todayAnnouncements: 14,
    uptime: '98.7%',
  },
  {
    id: '7',
    name: 'Venezia Mestre',
    address: 'Via Piave 22, Mestre',
    status: 'online' as const,
    isPlaying: true,
    currentTrack: 'Smooth Jazz Collection',
    currentPlaylist: 'Jazz & Soul',
    volume: 50,
    lastSync: '45 sec fa',
    todayPlays: 267,
    todayAnnouncements: 19,
    uptime: '99.4%',
  },
  {
    id: '8',
    name: 'Palermo Centrale',
    address: 'Via Roma 88, Palermo',
    status: 'online' as const,
    isPlaying: true,
    currentTrack: 'Mediterranean Beats',
    currentPlaylist: 'World Music',
    volume: 72,
    lastSync: '2 min fa',
    todayPlays: 143,
    todayAnnouncements: 11,
    uptime: '97.8%',
  },
]

const statusFilters = [
  { value: 'all', label: 'Tutti', count: 8 },
  { value: 'online', label: 'Online', count: 6 },
  { value: 'offline', label: 'Offline', count: 1 },
  { value: 'warning', label: 'Problemi', count: 1 },
]

interface StoreCardProps {
  store: typeof mockStores[0]
  onSelect: () => void
  onTogglePlay: () => void
  onVolumeChange: (volume: number) => void
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onSelect, onTogglePlay, onVolumeChange }) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-surface-600',
    warning: 'bg-warning-500',
  }

  const statusBgColors = {
    online: 'bg-success-500/10 border-success-500/20',
    offline: 'bg-surface-800/50 border-surface-700/50',
    warning: 'bg-warning-500/10 border-warning-500/20',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'relative p-5 rounded-2xl border transition-all duration-200',
        'hover:shadow-lg hover:shadow-brand-500/5',
        statusBgColors[store.status]
      )}
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className={cn('w-2.5 h-2.5 rounded-full', statusColors[store.status])}>
          {store.status === 'online' && (
            <div className={cn('w-2.5 h-2.5 rounded-full animate-ping', statusColors[store.status])} />
          )}
        </div>
        <button className="p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Store info */}
      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          'p-3 rounded-xl',
          store.status === 'online' ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-700/50 text-surface-400'
        )}>
          <Store className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-surface-100 truncate">{store.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-surface-400">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{store.address}</span>
          </div>
        </div>
      </div>

      {/* Now playing */}
      {store.status !== 'offline' && (
        <div className="mb-4 p-3 rounded-xl bg-surface-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-surface-500 uppercase tracking-wider">In riproduzione</span>
            {store.isPlaying && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-brand-500 rounded-full"
                    animate={{ height: [4, 12, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-surface-200 truncate">{store.currentTrack}</p>
          <p className="text-xs text-surface-500 mt-0.5">{store.currentPlaylist}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-surface-800/30">
          <p className="text-lg font-semibold text-surface-200">{store.todayPlays}</p>
          <p className="text-xs text-surface-500">Brani</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-surface-800/30">
          <p className="text-lg font-semibold text-surface-200">{store.todayAnnouncements}</p>
          <p className="text-xs text-surface-500">Annunci</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-surface-800/30">
          <p className="text-lg font-semibold text-surface-200">{store.uptime}</p>
          <p className="text-xs text-surface-500">Uptime</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={store.isPlaying ? 'secondary' : 'primary'}
          size="sm"
          onClick={onTogglePlay}
          disabled={store.status === 'offline'}
          className="flex-1"
        >
          {store.isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-1.5" />
              Pausa
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1.5" />
              Riproduci
            </>
          )}
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            disabled={store.status === 'offline'}
          >
            {store.volume > 0 ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span className="ml-1 text-xs">{store.volume}%</span>
          </Button>

          <AnimatePresence>
            {showVolumeSlider && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-xl bg-surface-800 border border-surface-700 shadow-xl"
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={store.volume}
                  onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                  className="w-24 accent-brand-500"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button variant="ghost" size="sm" onClick={onSelect}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Last sync */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-700/50">
        <div className="flex items-center gap-1.5 text-xs text-surface-500">
          {store.status === 'online' ? (
            <Wifi className="w-3.5 h-3.5 text-success-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-surface-500" />
          )}
          <span>Sync: {store.lastSync}</span>
        </div>
        {store.status === 'warning' && (
          <Badge variant="warning" size="sm">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Volume alto
          </Badge>
        )}
      </div>
    </motion.div>
  )
}

// Modal per nuovo store
interface NewStoreModalProps {
  isOpen: boolean
  onClose: () => void
}

const NewStoreModal: React.FC<NewStoreModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    activationCode: '',
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aggiungi Nuovo Negozio" size="md">
      <div className="space-y-6">
        {step === 1 && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  Nome Negozio
                </label>
                <Input
                  placeholder="Es. Milano Centro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  Indirizzo
                </label>
                <Input
                  placeholder="Es. Via Roma 15, Milano"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>Annulla</Button>
              <Button onClick={() => setStep(2)}>Continua</Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/20 flex items-center justify-center">
                <Power className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="text-lg font-semibold text-surface-100 mb-2">
                Codice di Attivazione
              </h3>
              <p className="text-surface-400 text-sm mb-6">
                Inserisci questo codice nel player del negozio
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-surface-800 border border-surface-700">
                <span className="text-2xl font-mono font-bold text-brand-400 tracking-widest">
                  DFM-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-surface-500 mt-4">
                Il codice scade tra 24 ore
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>Indietro</Button>
              <Button onClick={onClose}>
                <Check className="w-4 h-4 mr-1.5" />
                Fatto
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export const StoresPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewStoreModal, setShowNewStoreModal] = useState(false)
  const [stores, setStores] = useState(mockStores)

  const filteredStores = stores.filter((store) => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleTogglePlay = (storeId: string) => {
    setStores(stores.map(s => 
      s.id === storeId ? { ...s, isPlaying: !s.isPlaying } : s
    ))
  }

  const handleVolumeChange = (storeId: string, volume: number) => {
    setStores(stores.map(s => 
      s.id === storeId ? { ...s, volume } : s
    ))
  }

  return (
    <>
      <Header
        title="Negozi"
        subtitle={`${stores.length} negozi nella tua rete`}
        action={{ 
          label: 'Nuovo Negozio', 
          icon: Plus,
          onClick: () => setShowNewStoreModal(true) 
        }}
      />

      <div className="p-8">
        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'p-4 rounded-xl border transition-all duration-200',
                statusFilter === filter.value
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                  : 'bg-surface-900/50 border-surface-800/50 text-surface-400 hover:bg-surface-800/50'
              )}
            >
              <p className="text-2xl font-bold">{filter.count}</p>
              <p className="text-sm">{filter.label}</p>
            </button>
          ))}
        </div>

        {/* Search and filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
            <input
              type="text"
              placeholder="Cerca negozi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500/50"
            />
          </div>
          <Button variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Aggiorna tutto
          </Button>
        </div>

        {/* Stores grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onSelect={() => {}}
                onTogglePlay={() => handleTogglePlay(store.id)}
                onVolumeChange={(volume) => handleVolumeChange(store.id, volume)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredStores.length === 0 && (
          <div className="text-center py-16">
            <Store className="w-16 h-16 mx-auto mb-4 text-surface-600" />
            <h3 className="text-lg font-semibold text-surface-300 mb-2">
              Nessun negozio trovato
            </h3>
            <p className="text-surface-500">
              Prova a modificare i filtri di ricerca
            </p>
          </div>
        )}
      </div>

      <NewStoreModal 
        isOpen={showNewStoreModal} 
        onClose={() => setShowNewStoreModal(false)} 
      />
    </>
  )
}
