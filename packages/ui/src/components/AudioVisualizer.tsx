import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

interface AudioVisualizerProps {
  isPlaying: boolean
  className?: string
  barCount?: number
  variant?: 'default' | 'minimal' | 'circle'
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  className,
  barCount = 5,
  variant = 'default',
}) => {
  const bars = Array.from({ length: barCount }, (_, i) => i)

  if (variant === 'circle') {
    return (
      <div className={cn('relative w-16 h-16', className)}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {bars.map((i) => {
            const angle = (i / barCount) * 360
            const delay = i * 0.1
            return (
              <motion.line
                key={i}
                x1="50"
                y1="50"
                x2="50"
                y2="30"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                style={{
                  transformOrigin: '50px 50px',
                  transform: `rotate(${angle}deg)`,
                }}
                animate={
                  isPlaying
                    ? {
                        y2: [30, 20, 35, 25, 30],
                      }
                    : { y2: 40 }
                }
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />
            )
          })}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-end gap-0.5 h-4', className)}>
        {bars.map((i) => (
          <motion.div
            key={i}
            className="w-0.5 bg-brand-500 rounded-full"
            animate={
              isPlaying
                ? {
                    height: ['40%', '100%', '60%', '90%', '40%'],
                  }
                : { height: '20%' }
            }
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex items-end justify-center gap-1 h-16', className)}>
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-2 bg-gradient-to-t from-brand-500 to-accent-400 rounded-full"
          animate={
            isPlaying
              ? {
                  height: ['30%', '100%', '50%', '80%', '30%'],
                }
              : { height: '15%' }
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

interface WaveformProps {
  className?: string
  isPlaying: boolean
}

export const Waveform: React.FC<WaveformProps> = ({ className, isPlaying }) => {
  return (
    <div className={cn('flex items-center gap-[2px]', className)}>
      {Array.from({ length: 40 }, (_, i) => {
        const height = Math.sin(i * 0.3) * 50 + 50
        return (
          <motion.div
            key={i}
            className="w-[2px] bg-gradient-to-t from-brand-500/50 to-accent-400/50 rounded-full"
            style={{ height: `${height}%` }}
            animate={
              isPlaying
                ? {
                    scaleY: [1, 1.5, 0.8, 1.2, 1],
                    opacity: [0.5, 1, 0.7, 0.9, 0.5],
                  }
                : { scaleY: 0.3, opacity: 0.3 }
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.05,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}
