import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Store,
  Music,
  Mic2,
  Users,
  Clock,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  Play,
  Volume2,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, Badge, Button, cn } from '@dockfm/ui'
import { Header } from '../components/layout/Header'

// Mock data
const overviewStats = [
  {
    label: 'Totale Riproduzioni',
    value: '45,234',
    change: '+12.5%',
    trend: 'up',
    icon: Play,
    color: 'brand',
  },
  {
    label: 'Annunci Trasmessi',
    value: '1,847',
    change: '+8.2%',
    trend: 'up',
    icon: Mic2,
    color: 'accent',
  },
  {
    label: 'Ore di Streaming',
    value: '2,156',
    change: '+15.3%',
    trend: 'up',
    icon: Clock,
    color: 'success',
  },
  {
    label: 'Negozi Attivi',
    value: '12/12',
    change: '100%',
    trend: 'up',
    icon: Store,
    color: 'warning',
  },
]

const storePerformance = [
  { id: '1', name: 'Milano Centro', plays: 5432, announcements: 234, uptime: 99.8, trend: 'up' },
  { id: '2', name: 'Roma Termini', plays: 4876, announcements: 198, uptime: 99.5, trend: 'up' },
  { id: '3', name: 'Firenze SMN', plays: 4234, announcements: 187, uptime: 99.9, trend: 'up' },
  { id: '4', name: 'Bologna Centrale', plays: 3987, announcements: 156, uptime: 95.3, trend: 'down' },
  { id: '5', name: 'Napoli Centrale', plays: 3654, announcements: 143, uptime: 98.7, trend: 'up' },
  { id: '6', name: 'Venezia Mestre', plays: 3421, announcements: 134, uptime: 99.4, trend: 'up' },
]

const topPlaylists = [
  { id: '1', name: 'Chill Afternoon', plays: 12453, hours: 234, engagement: 92 },
  { id: '2', name: 'Morning Energy', plays: 10234, hours: 198, engagement: 88 },
  { id: '3', name: 'Evening Jazz', plays: 8765, hours: 167, engagement: 95 },
  { id: '4', name: 'Pop Hits 2024', plays: 7654, hours: 145, engagement: 85 },
  { id: '5', name: 'Acoustic Sessions', plays: 6543, hours: 123, engagement: 90 },
]

const topAnnouncements = [
  { id: '1', name: 'Promo Weekend -20%', plays: 456, ctr: 3.2, stores: 12 },
  { id: '2', name: 'Flash Sale Elettronica', plays: 234, ctr: 4.5, stores: 8 },
  { id: '3', name: 'Nuova Collezione', plays: 198, ctr: 2.8, stores: 10 },
  { id: '4', name: 'Programma Fedeltà', plays: 156, ctr: 3.9, stores: 12 },
]

const hourlyData = [
  { hour: '06', plays: 120, announcements: 5 },
  { hour: '07', plays: 340, announcements: 8 },
  { hour: '08', plays: 580, announcements: 12 },
  { hour: '09', plays: 890, announcements: 15 },
  { hour: '10', plays: 1200, announcements: 18 },
  { hour: '11', plays: 1450, announcements: 20 },
  { hour: '12', plays: 1100, announcements: 22 },
  { hour: '13', plays: 980, announcements: 18 },
  { hour: '14', plays: 1150, announcements: 20 },
  { hour: '15', plays: 1300, announcements: 22 },
  { hour: '16', plays: 1450, announcements: 24 },
  { hour: '17', plays: 1600, announcements: 26 },
  { hour: '18', plays: 1400, announcements: 22 },
  { hour: '19', plays: 1100, announcements: 18 },
  { hour: '20', plays: 800, announcements: 12 },
  { hour: '21', plays: 500, announcements: 8 },
  { hour: '22', plays: 300, announcements: 5 },
  { hour: '23', plays: 150, announcements: 3 },
]

// Chart component (simplified bar chart)
const BarChartSimple: React.FC<{ data: typeof hourlyData }> = ({ data }) => {
  const maxPlays = Math.max(...data.map(d => d.plays))

  return (
    <div className="h-48 flex items-end gap-1">
      {data.map((item, i) => (
        <div key={item.hour} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.plays / maxPlays) * 100}%` }}
            transition={{ delay: i * 0.03, duration: 0.5 }}
            className="w-full bg-gradient-to-t from-brand-500 to-brand-400 rounded-t-sm relative group"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-surface-800 text-xs text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.plays} plays
            </div>
          </motion.div>
          <span className="text-xs text-surface-500">{item.hour}</span>
        </div>
      ))}
    </div>
  )
}

// Stat card component
const StatCard: React.FC<{
  stat: typeof overviewStats[0]
  index: number
}> = ({ stat, index }) => {
  const colorClasses = {
    brand: 'bg-brand-500/20 text-brand-400',
    accent: 'bg-accent-500/20 text-accent-400',
    success: 'bg-success-500/20 text-success-400',
    warning: 'bg-warning-500/20 text-warning-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card variant="glass" className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-surface-400 text-sm">{stat.label}</p>
            <p className="text-3xl font-display font-bold text-surface-100 mt-1">
              {stat.value}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {stat.trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-success-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-error-400" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  stat.trend === 'up' ? 'text-success-400' : 'text-error-400'
                )}
              >
                {stat.change}
              </span>
              <span className="text-xs text-surface-500">vs mese scorso</span>
            </div>
          </div>
          <div className={cn('p-3 rounded-xl', colorClasses[stat.color as keyof typeof colorClasses])}>
            <stat.icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedStore, setSelectedStore] = useState('all')

  return (
    <>
      <Header
        title="Analytics"
        subtitle="Statistiche e report dettagliati"
        action={{
          label: 'Esporta Report',
          icon: Download,
          onClick: () => {},
        }}
      />

      <div className="p-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-900/50 border border-surface-800/50">
            {[
              { id: '24h', label: '24 ore' },
              { id: '7d', label: '7 giorni' },
              { id: '30d', label: '30 giorni' },
              { id: '90d', label: '90 giorni' },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm transition-all',
                  timeRange === range.id
                    ? 'bg-brand-500 text-white'
                    : 'text-surface-400 hover:text-surface-200'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>

          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-4 py-2 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 focus:outline-none focus:border-brand-500/50"
          >
            <option value="all">Tutti i negozi</option>
            <option value="milano">Milano Centro</option>
            <option value="roma">Roma Termini</option>
            <option value="firenze">Firenze SMN</option>
          </select>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Hourly chart */}
          <Card variant="glass" className="col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-surface-100">
                  Attività per fascia oraria
                </h3>
                <p className="text-sm text-surface-400">Riproduzioni nelle ultime 24 ore</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-500" />
                  <span className="text-surface-400">Riproduzioni</span>
                </div>
              </div>
            </div>
            <BarChartSimple data={hourlyData} />
          </Card>

          {/* Quick insights */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-surface-100 mb-4">
              Insights rapidi
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-success-500/10 border border-success-500/20">
                <div className="flex items-center gap-2 text-success-400 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Picco ore 17:00</span>
                </div>
                <p className="text-sm text-surface-400">
                  Il massimo delle riproduzioni è tra le 16:00 e le 18:00
                </p>
              </div>
              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <div className="flex items-center gap-2 text-brand-400 mb-2">
                  <Music className="w-4 h-4" />
                  <span className="font-medium">Top Playlist</span>
                </div>
                <p className="text-sm text-surface-400">
                  "Chill Afternoon" è la playlist più ascoltata
                </p>
              </div>
              <div className="p-4 rounded-xl bg-accent-500/10 border border-accent-500/20">
                <div className="flex items-center gap-2 text-accent-400 mb-2">
                  <Mic2 className="w-4 h-4" />
                  <span className="font-medium">Annuncio efficace</span>
                </div>
                <p className="text-sm text-surface-400">
                  "Flash Sale" ha il CTR più alto: 4.5%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Store performance */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-100">
                Performance Negozi
              </h3>
              <Button variant="ghost" size="sm">
                Vedi tutti
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-surface-500 border-b border-surface-800/50">
                    <th className="pb-3 font-medium">Negozio</th>
                    <th className="pb-3 font-medium text-right">Plays</th>
                    <th className="pb-3 font-medium text-right">Annunci</th>
                    <th className="pb-3 font-medium text-right">Uptime</th>
                  </tr>
                </thead>
                <tbody>
                  {storePerformance.map((store) => (
                    <tr key={store.id} className="border-b border-surface-800/30">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-surface-500" />
                          <span className="text-surface-200">{store.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-surface-200">{store.plays.toLocaleString()}</span>
                          {store.trend === 'up' ? (
                            <ArrowUpRight className="w-3 h-3 text-success-400" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-error-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right text-surface-300">{store.announcements}</td>
                      <td className="py-3 text-right">
                        <span className={cn(
                          'text-sm',
                          store.uptime >= 99 ? 'text-success-400' : 
                          store.uptime >= 95 ? 'text-warning-400' : 'text-error-400'
                        )}>
                          {store.uptime}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top playlists & announcements */}
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-surface-100 mb-4">
                Top Playlist
              </h3>
              <div className="space-y-3">
                {topPlaylists.slice(0, 4).map((playlist, i) => (
                  <div key={playlist.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-surface-800 flex items-center justify-center text-xs text-surface-400">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-200 truncate">{playlist.name}</p>
                      <p className="text-xs text-surface-500">{playlist.plays.toLocaleString()} plays</p>
                    </div>
                    <Badge variant="secondary" size="sm" className="bg-success-500/20 text-success-400">
                      {playlist.engagement}%
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-surface-100 mb-4">
                Top Annunci
              </h3>
              <div className="space-y-3">
                {topAnnouncements.map((announcement, i) => (
                  <div key={announcement.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-surface-800 flex items-center justify-center text-xs text-surface-400">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-200 truncate">{announcement.name}</p>
                      <p className="text-xs text-surface-500">{announcement.plays} riproduzioni</p>
                    </div>
                    <Badge variant="secondary" size="sm" className="bg-brand-500/20 text-brand-400">
                      CTR {announcement.ctr}%
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Export section */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-surface-100">
                Esporta Report
              </h3>
              <p className="text-sm text-surface-400">
                Scarica i dati in formato CSV o PDF per analisi approfondite
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
