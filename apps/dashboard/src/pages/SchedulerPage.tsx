import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Music,
  Mic2,
  GripVertical,
  X,
  Save,
  Copy,
  Trash2,
  Play,
  Pause,
  Volume2,
  Store,
  Layers,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Edit,
  Eye,
  MoreVertical,
} from 'lucide-react'
import { Card, Badge, Button, Modal, cn } from '@dockfm/ui'
import { Header } from '../components/layout/Header'

// Types
interface ScheduleBlock {
  id: string
  type: 'playlist' | 'announcement'
  title: string
  startTime: string
  endTime: string
  color: string
}

interface DaySchedule {
  date: string
  dayName: string
  blocks: ScheduleBlock[]
}

// Mock data
const mockSchedule: DaySchedule[] = [
  {
    date: '2024-01-06',
    dayName: 'Lunedì',
    blocks: [
      { id: '1', type: 'playlist', title: 'Morning Energy', startTime: '06:00', endTime: '10:00', color: 'bg-orange-500' },
      { id: '2', type: 'announcement', title: 'Apertura', startTime: '09:00', endTime: '09:01', color: 'bg-brand-500' },
      { id: '3', type: 'playlist', title: 'Acoustic Sessions', startTime: '10:00', endTime: '14:00', color: 'bg-amber-500' },
      { id: '4', type: 'announcement', title: 'Promo Flash', startTime: '12:00', endTime: '12:01', color: 'bg-brand-500' },
      { id: '5', type: 'playlist', title: 'Chill Afternoon', startTime: '14:00', endTime: '18:00', color: 'bg-blue-500' },
      { id: '6', type: 'playlist', title: 'Evening Jazz', startTime: '18:00', endTime: '21:00', color: 'bg-purple-500' },
      { id: '7', type: 'announcement', title: 'Chiusura', startTime: '20:45', endTime: '20:46', color: 'bg-brand-500' },
      { id: '8', type: 'playlist', title: 'Lounge & Chillout', startTime: '21:00', endTime: '23:00', color: 'bg-cyan-500' },
    ]
  },
]

const timeSlots = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6
  return `${hour.toString().padStart(2, '0')}:00`
})

const stores = [
  { id: '1', name: 'Milano Centro' },
  { id: '2', name: 'Roma Termini' },
  { id: '3', name: 'Firenze SMN' },
  { id: '4', name: 'Bologna Centrale' },
  { id: 'all', name: 'Tutti i negozi' },
]

const dayParts = [
  { id: 'morning', label: 'Mattina', icon: Sunrise, time: '06:00-12:00', color: 'text-orange-400' },
  { id: 'afternoon', label: 'Pomeriggio', icon: Sun, time: '12:00-18:00', color: 'text-yellow-400' },
  { id: 'evening', label: 'Sera', icon: Sunset, time: '18:00-21:00', color: 'text-purple-400' },
  { id: 'night', label: 'Notte', icon: Moon, time: '21:00-24:00', color: 'text-blue-400' },
]

// Timeline component
const TimelineView: React.FC<{
  schedule: DaySchedule
  onBlockClick: (block: ScheduleBlock) => void
}> = ({ schedule, onBlockClick }) => {
  const getBlockPosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = (hours - 6) * 60 + minutes
    return (totalMinutes / (18 * 60)) * 100
  }

  const getBlockWidth = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const startMinutes = (startH - 6) * 60 + startM
    const endMinutes = (endH - 6) * 60 + endM
    const durationMinutes = endMinutes - startMinutes
    return Math.max((durationMinutes / (18 * 60)) * 100, 2)
  }

  return (
    <div className="relative">
      {/* Time header */}
      <div className="flex border-b border-surface-800/50 mb-4">
        {timeSlots.map((time, i) => (
          <div
            key={time}
            className="flex-1 text-center text-xs text-surface-500 py-2 border-l border-surface-800/30 first:border-l-0"
          >
            {time}
          </div>
        ))}
      </div>

      {/* Timeline rows */}
      <div className="space-y-3">
        {/* Playlist row */}
        <div className="relative h-16 bg-surface-900/30 rounded-xl overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-surface-800/50 flex items-center justify-center border-r border-surface-700/50">
            <div className="flex items-center gap-2 text-surface-400">
              <Music className="w-4 h-4" />
              <span className="text-xs font-medium">Musica</span>
            </div>
          </div>
          <div className="ml-20 relative h-full">
            {/* Grid lines */}
            <div className="absolute inset-0 flex">
              {timeSlots.map((_, i) => (
                <div key={i} className="flex-1 border-l border-surface-800/30 first:border-l-0" />
              ))}
            </div>
            {/* Blocks */}
            {schedule.blocks
              .filter(b => b.type === 'playlist')
              .map((block) => (
                <motion.button
                  key={block.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    'absolute top-1 bottom-1 rounded-lg px-2 flex items-center gap-2 cursor-pointer transition-all hover:ring-2 hover:ring-white/20',
                    block.color
                  )}
                  style={{
                    left: `${getBlockPosition(block.startTime)}%`,
                    width: `${getBlockWidth(block.startTime, block.endTime)}%`,
                  }}
                  onClick={() => onBlockClick(block)}
                >
                  <Music className="w-3 h-3 text-white/80 flex-shrink-0" />
                  <span className="text-xs text-white font-medium truncate">
                    {block.title}
                  </span>
                </motion.button>
              ))}
          </div>
        </div>

        {/* Announcements row */}
        <div className="relative h-12 bg-surface-900/30 rounded-xl overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-surface-800/50 flex items-center justify-center border-r border-surface-700/50">
            <div className="flex items-center gap-2 text-surface-400">
              <Mic2 className="w-4 h-4" />
              <span className="text-xs font-medium">Annunci</span>
            </div>
          </div>
          <div className="ml-20 relative h-full">
            {/* Grid lines */}
            <div className="absolute inset-0 flex">
              {timeSlots.map((_, i) => (
                <div key={i} className="flex-1 border-l border-surface-800/30 first:border-l-0" />
              ))}
            </div>
            {/* Announcement markers */}
            {schedule.blocks
              .filter(b => b.type === 'announcement')
              .map((block) => (
                <motion.button
                  key={block.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-brand-400/50 transition-all"
                  style={{ left: `calc(${getBlockPosition(block.startTime)}% - 12px)` }}
                  onClick={() => onBlockClick(block)}
                  title={`${block.title} - ${block.startTime}`}
                >
                  <Mic2 className="w-3 h-3 text-white" />
                </motion.button>
              ))}
          </div>
        </div>
      </div>

      {/* Current time indicator */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
        style={{ left: `calc(20px + ${((new Date().getHours() - 6) / 18) * 100}%)` }}
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500" />
      </div>
    </div>
  )
}

// Day overview cards
const DayOverview: React.FC<{
  schedule: DaySchedule
}> = ({ schedule }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {dayParts.map((part) => {
        const blocksInPart = schedule.blocks.filter(b => {
          const hour = parseInt(b.startTime.split(':')[0])
          if (part.id === 'morning') return hour >= 6 && hour < 12
          if (part.id === 'afternoon') return hour >= 12 && hour < 18
          if (part.id === 'evening') return hour >= 18 && hour < 21
          return hour >= 21
        })

        return (
          <Card key={part.id} variant="glass" className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <part.icon className={cn('w-5 h-5', part.color)} />
              <div>
                <p className="font-medium text-surface-200">{part.label}</p>
                <p className="text-xs text-surface-500">{part.time}</p>
              </div>
            </div>
            <div className="space-y-2">
              {blocksInPart.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-surface-800/30"
                >
                  {block.type === 'playlist' ? (
                    <Music className="w-3.5 h-3.5 text-surface-400" />
                  ) : (
                    <Mic2 className="w-3.5 h-3.5 text-brand-400" />
                  )}
                  <span className="text-sm text-surface-300 truncate">{block.title}</span>
                  <span className="text-xs text-surface-500 ml-auto">{block.startTime}</span>
                </div>
              ))}
              {blocksInPart.length === 0 && (
                <p className="text-xs text-surface-500 text-center py-2">Nessun blocco</p>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// Add block modal
interface AddBlockModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddBlockModal: React.FC<AddBlockModalProps> = ({ isOpen, onClose }) => {
  const [blockType, setBlockType] = useState<'playlist' | 'announcement'>('playlist')
  const [selectedItem, setSelectedItem] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('12:00')

  const playlists = [
    { id: '1', name: 'Morning Energy' },
    { id: '2', name: 'Chill Afternoon' },
    { id: '3', name: 'Evening Jazz' },
    { id: '4', name: 'Pop Hits 2024' },
  ]

  const announcements = [
    { id: '1', name: 'Apertura' },
    { id: '2', name: 'Promo Weekend' },
    { id: '3', name: 'Chiusura' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aggiungi Blocco" size="md">
      <div className="space-y-6">
        {/* Block type */}
        <div className="flex gap-2">
          <button
            onClick={() => setBlockType('playlist')}
            className={cn(
              'flex-1 p-4 rounded-xl border transition-all',
              blockType === 'playlist'
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                : 'border-surface-700 text-surface-400 hover:bg-surface-800/50'
            )}
          >
            <Music className="w-6 h-6 mx-auto mb-2" />
            <p className="font-medium">Playlist</p>
          </button>
          <button
            onClick={() => setBlockType('announcement')}
            className={cn(
              'flex-1 p-4 rounded-xl border transition-all',
              blockType === 'announcement'
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                : 'border-surface-700 text-surface-400 hover:bg-surface-800/50'
            )}
          >
            <Mic2 className="w-6 h-6 mx-auto mb-2" />
            <p className="font-medium">Annuncio</p>
          </button>
        </div>

        {/* Select item */}
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Seleziona {blockType === 'playlist' ? 'playlist' : 'annuncio'}
          </label>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full p-3 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 focus:outline-none focus:border-brand-500/50"
          >
            <option value="">Seleziona...</option>
            {(blockType === 'playlist' ? playlists : announcements).map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Inizio
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 focus:outline-none focus:border-brand-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Fine
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-800/50">
          <Button variant="ghost" onClick={onClose}>Annulla</Button>
          <Button>
            <Plus className="w-4 h-4 mr-1.5" />
            Aggiungi
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export const SchedulerPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStore, setSelectedStore] = useState('all')
  const [viewMode, setViewMode] = useState<'timeline' | 'overview'>('timeline')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null)

  const currentSchedule = mockSchedule[0]

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date)
  }

  return (
    <>
      <Header
        title="Programmazione"
        subtitle="Gestisci il palinsesto audio dei tuoi negozi"
        action={{
          label: 'Aggiungi Blocco',
          icon: Plus,
          onClick: () => setShowAddModal(true),
        }}
      />

      <div className="p-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          {/* Date navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
              className="p-2 rounded-lg hover:bg-surface-800/50 text-surface-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-lg font-semibold text-surface-100 capitalize">
                {formatDate(selectedDate)}
              </p>
              <button className="text-sm text-brand-400 hover:text-brand-300">
                Vai a oggi
              </button>
            </div>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
              className="p-2 rounded-lg hover:bg-surface-800/50 text-surface-400 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Store selector */}
          <div className="flex items-center gap-4">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="px-4 py-2 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 focus:outline-none focus:border-brand-500/50"
            >
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-900/50 border border-surface-800/50">
              <button
                onClick={() => setViewMode('timeline')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition-all',
                  viewMode === 'timeline'
                    ? 'bg-brand-500 text-white'
                    : 'text-surface-400 hover:text-surface-200'
                )}
              >
                <Clock className="w-4 h-4 inline-block mr-1.5" />
                Timeline
              </button>
              <button
                onClick={() => setViewMode('overview')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition-all',
                  viewMode === 'overview'
                    ? 'bg-brand-500 text-white'
                    : 'text-surface-400 hover:text-surface-200'
                )}
              >
                <Layers className="w-4 h-4 inline-block mr-1.5" />
                Panoramica
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {viewMode === 'timeline' ? (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card variant="glass" className="p-6">
                <TimelineView
                  schedule={currentSchedule}
                  onBlockClick={setSelectedBlock}
                />
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DayOverview schedule={currentSchedule} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Blocchi oggi</p>
                <p className="text-2xl font-bold text-surface-100">
                  {currentSchedule.blocks.length}
                </p>
              </div>
              <Layers className="w-8 h-8 text-brand-400" />
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Ore di musica</p>
                <p className="text-2xl font-bold text-surface-100">17h</p>
              </div>
              <Music className="w-8 h-8 text-accent-400" />
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Annunci programmati</p>
                <p className="text-2xl font-bold text-surface-100">
                  {currentSchedule.blocks.filter(b => b.type === 'announcement').length}
                </p>
              </div>
              <Mic2 className="w-8 h-8 text-success-400" />
            </div>
          </Card>
        </div>

        {/* Templates */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">Template rapidi</h3>
          <div className="flex gap-4">
            {[
              { name: 'Giorno feriale', desc: '6:00-23:00' },
              { name: 'Weekend', desc: '9:00-24:00' },
              { name: 'Festivo', desc: '10:00-20:00' },
            ].map((template) => (
              <button
                key={template.name}
                className="flex-1 p-4 rounded-xl border border-surface-800/50 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all text-left"
              >
                <p className="font-medium text-surface-200">{template.name}</p>
                <p className="text-sm text-surface-500">{template.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <AddBlockModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  )
}
