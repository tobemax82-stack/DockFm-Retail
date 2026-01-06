import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Thermometer, CloudSun, Radio } from 'lucide-react'

export const StatusBar: React.FC = () => {
  const [time, setTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = time.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const formattedDate = time.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 border-t border-surface-800/50 bg-surface-900/30"
    >
      {/* Time */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-brand-400" />
          <div>
            <p className="text-2xl font-display font-bold text-surface-100 time-glow">
              {formattedTime}
            </p>
            <p className="text-xs text-surface-500 capitalize">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Weather (placeholder) */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800/50 border border-surface-700/50">
          <CloudSun className="w-5 h-5 text-accent-400" />
          <span className="text-surface-300">22°C</span>
          <span className="text-surface-500 text-sm">Milano</span>
        </div>

        {/* Current mood/mode */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
          <Radio className="w-4 h-4 text-brand-400" />
          <span className="text-brand-300 text-sm">Mood: Lounge</span>
        </div>
      </div>

      {/* Next scheduled event */}
      <div className="flex items-center gap-3 text-right">
        <div>
          <p className="text-xs text-surface-500">Prossimo annuncio</p>
          <p className="text-sm text-surface-300">Promo Weekend • 14:30</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent-500/20 border border-accent-500/30 flex items-center justify-center">
          <span className="text-accent-400 text-xs font-mono">12m</span>
        </div>
      </div>
    </motion.div>
  )
}
