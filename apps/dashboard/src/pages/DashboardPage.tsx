import React from 'react'
import { motion } from 'framer-motion'
import {
  Store,
  Music,
  Mic2,
  Radio,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Card, Badge, Button, Progress, StatusIndicator, cn } from '@dockfm/ui'
import { Header } from '../components/layout/Header'

// Mock data
const stats = [
  {
    label: 'Negozi Attivi',
    value: '12',
    change: '+2',
    trend: 'up',
    icon: Store,
    color: 'brand',
  },
  {
    label: 'In Riproduzione',
    value: '10',
    change: '83%',
    trend: 'up',
    icon: Radio,
    color: 'accent',
  },
  {
    label: 'Annunci Oggi',
    value: '156',
    change: '+23',
    trend: 'up',
    icon: Mic2,
    color: 'success',
  },
  {
    label: 'Brani in Rotazione',
    value: '2,340',
    change: '+120',
    trend: 'up',
    icon: Music,
    color: 'warning',
  },
]

const stores = [
  { id: 1, name: 'Milano Centro', status: 'online', playing: true, track: 'Lounge Mix', volume: 65 },
  { id: 2, name: 'Roma Termini', status: 'online', playing: true, track: 'Jazz Cafe', volume: 70 },
  { id: 3, name: 'Torino Porta Nuova', status: 'offline', playing: false, track: '-', volume: 0 },
  { id: 4, name: 'Firenze SMN', status: 'online', playing: true, track: 'Acoustic Morning', volume: 55 },
  { id: 5, name: 'Bologna Centrale', status: 'warning', playing: true, track: 'Pop Hits', volume: 80 },
]

const recentAnnouncements = [
  { id: 1, title: 'Promo Weekend', plays: 45, stores: 12, status: 'active' },
  { id: 2, title: 'Chiusura 20:00', plays: 12, stores: 12, status: 'scheduled' },
  { id: 3, title: 'Offerta Flash', plays: 23, stores: 8, status: 'active' },
]

export const DashboardPage: React.FC = () => {
  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Panoramica di tutti i tuoi negozi"
        action={{ label: 'Nuovo Negozio', onClick: () => {} }}
      />

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass" className="stat-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-surface-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-display font-bold text-surface-100 mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-success-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-error-400" />
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          stat.trend === 'up' ? 'text-success-400' : 'text-error-400'
                        )}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'p-3 rounded-xl',
                      stat.color === 'brand' && 'bg-brand-500/20 text-brand-400',
                      stat.color === 'accent' && 'bg-accent-500/20 text-accent-400',
                      stat.color === 'success' && 'bg-success-500/20 text-success-400',
                      stat.color === 'warning' && 'bg-warning-500/20 text-warning-400'
                    )}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stores List */}
          <div className="lg:col-span-2">
            <Card variant="glass">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-surface-100">
                  Stato Negozi
                </h2>
                <Button variant="ghost" size="sm">
                  Vedi tutti
                </Button>
              </div>

              <div className="space-y-3">
                {stores.map((store, index) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'store-card',
                      store.status === 'online' && 'store-card-online',
                      store.status === 'offline' && 'store-card-offline',
                      store.status === 'warning' && 'store-card-warning'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <StatusIndicator
                            status={store.status as any}
                            pulse={store.status === 'online'}
                          />
                          <span className="font-medium text-surface-200">
                            {store.name}
                          </span>
                        </div>

                        {store.playing && (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/50">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-0.5 bg-brand-500 rounded-full"
                                  animate={{ height: [8, 16, 8] }}
                                  transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    delay: i * 0.1,
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-surface-400">
                              {store.track}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-surface-500" />
                          <span className="text-sm text-surface-400 w-8">
                            {store.volume}%
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={store.status === 'offline'}
                        >
                          {store.playing ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Announcements */}
          <div>
            <Card variant="glass">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-surface-100">
                  Annunci Recenti
                </h2>
                <Button variant="ghost" size="sm">
                  Vedi tutti
                </Button>
              </div>

              <div className="space-y-4">
                {recentAnnouncements.map((ann, index) => (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="announcement-card"
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        ann.status === 'active'
                          ? 'bg-success-500/20 text-success-400'
                          : 'bg-surface-700/50 text-surface-400'
                      )}
                    >
                      {ann.status === 'active' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-200 truncate">
                        {ann.title}
                      </p>
                      <p className="text-xs text-surface-500">
                        {ann.plays} riproduzioni • {ann.stores} negozi
                      </p>
                    </div>
                    <Badge
                      variant={ann.status === 'active' ? 'success' : 'default'}
                      size="sm"
                    >
                      {ann.status === 'active' ? 'Attivo' : 'Programmato'}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              {/* Quick action */}
              <div className="mt-6 pt-4 border-t border-surface-800/50">
                <Button variant="secondary" className="w-full">
                  <Mic2 className="w-4 h-4" />
                  Crea Nuovo Annuncio
                </Button>
              </div>
            </Card>

            {/* AI Suggestions */}
            <Card variant="brand" className="mt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brand-500/20">
                  <AlertCircle className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="font-medium text-surface-200">
                    Suggerimento AI
                  </p>
                  <p className="text-sm text-surface-400 mt-1">
                    Il negozio di Bologna ha un volume più alto della media.
                    Vuoi uniformarlo?
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" size="sm">
                      Applica
                    </Button>
                    <Button variant="ghost" size="sm">
                      Ignora
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
