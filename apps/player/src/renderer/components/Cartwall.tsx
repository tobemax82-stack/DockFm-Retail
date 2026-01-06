import React from 'react'
import { motion } from 'framer-motion'
import { Mic, AlertTriangle, Clock, Megaphone } from 'lucide-react'
import { cn } from '@dockfm/ui'
import { usePlayerStore, CartwallItem } from '../store/playerStore'

const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  brand: {
    bg: 'bg-brand-500/20',
    border: 'border-brand-500/30 hover:border-brand-500/50',
    text: 'text-brand-300',
    icon: 'text-brand-400',
  },
  accent: {
    bg: 'bg-accent-500/20',
    border: 'border-accent-500/30 hover:border-accent-500/50',
    text: 'text-accent-300',
    icon: 'text-accent-400',
  },
  warning: {
    bg: 'bg-warning-500/20',
    border: 'border-warning-500/30 hover:border-warning-500/50',
    text: 'text-warning-300',
    icon: 'text-warning-400',
  },
  error: {
    bg: 'bg-error-500/20',
    border: 'border-error-500/30 hover:border-error-500/50',
    text: 'text-error-300',
    icon: 'text-error-400',
  },
}

const iconMap: Record<string, React.ElementType> = {
  brand: Mic,
  accent: Megaphone,
  warning: Clock,
  error: AlertTriangle,
}

interface CartwallButtonProps {
  item: CartwallItem
  onClick: () => void
}

const CartwallButton: React.FC<CartwallButtonProps> = ({ item, onClick }) => {
  const colors = colorMap[item.color] || colorMap.brand
  const Icon = iconMap[item.color] || Mic

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'cartwall-btn relative flex flex-col items-center justify-center',
        'w-full aspect-square rounded-2xl border-2 transition-all duration-300',
        colors.bg,
        colors.border,
        'group'
      )}
    >
      {/* Shortcut badge */}
      {item.shortcut && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-surface-800/80 border border-surface-700 flex items-center justify-center">
          <span className="text-xs font-mono text-surface-400">{item.shortcut}</span>
        </div>
      )}

      {/* Icon */}
      <div className={cn('mb-2 transition-transform group-hover:scale-110', colors.icon)}>
        <Icon className="w-8 h-8" />
      </div>

      {/* Label */}
      <span className={cn('text-sm font-medium', colors.text)}>
        {item.label}
      </span>

      {/* Duration */}
      <span className="text-xs text-surface-500 mt-1">
        {item.track.duration}s
      </span>
    </motion.button>
  )
}

export const Cartwall: React.FC = () => {
  const { cartwall, playCartwall } = usePlayerStore()

  return (
    <div className="p-6 border-t border-surface-800/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-surface-200">Annunci Rapidi</h3>
        <span className="text-xs text-surface-500">Premi 1-4 per attivare</span>
      </div>

      {/* Cartwall Grid */}
      <div className="grid grid-cols-4 gap-4">
        {cartwall.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CartwallButton
              item={item}
              onClick={() => playCartwall(item.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
