import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 48, text: 'text-2xl' },
  xl: { icon: 64, text: 'text-4xl' },
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  animated = false,
  showText = true,
  className,
}) => {
  const { icon, text } = sizeMap[size]

  const IconComponent = animated ? motion.svg : 'svg'
  const animationProps = animated
    ? {
        initial: { rotate: 0 },
        animate: { rotate: 360 },
        transition: { duration: 20, repeat: Infinity, ease: 'linear' },
      }
    : {}

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative">
        {/* Glow effect */}
        <div
          className="absolute inset-0 blur-xl opacity-50"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            borderRadius: '50%',
          }}
        />
        
        {/* Logo icon */}
        <IconComponent
          width={icon}
          height={icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative"
          {...animationProps}
        >
          {/* Outer ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            fill="none"
          />
          
          {/* Inner waves */}
          <path
            d="M30 50 Q35 35, 50 35 Q65 35, 70 50 Q65 65, 50 65 Q35 65, 30 50"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Sound bars */}
          <rect
            x="40"
            y="38"
            width="4"
            height="24"
            rx="2"
            fill="url(#logoGradient)"
          />
          <rect
            x="48"
            y="32"
            width="4"
            height="36"
            rx="2"
            fill="url(#logoGradient)"
          />
          <rect
            x="56"
            y="40"
            width="4"
            height="20"
            rx="2"
            fill="url(#logoGradient)"
          />
          
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </IconComponent>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-display font-bold text-gradient', text)}>
            DockFm
          </span>
          <span className="text-xs font-medium text-accent-400 tracking-wider uppercase">
            Retail
          </span>
        </div>
      )}
    </div>
  )
}

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error' | 'playing'
  label?: string
  pulse?: boolean
  className?: string
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = true,
  className,
}) => {
  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-surface-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    playing: 'bg-brand-500',
  }

  const statusGlow = {
    online: 'shadow-[0_0_8px_rgba(34,197,94,0.5)]',
    offline: '',
    warning: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    error: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    playing: 'shadow-[0_0_8px_rgba(99,102,241,0.5)]',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            statusColors[status],
            statusGlow[status]
          )}
        />
        {pulse && status !== 'offline' && (
          <div
            className={cn(
              'absolute inset-0 w-2 h-2 rounded-full animate-ping',
              statusColors[status],
              'opacity-75'
            )}
          />
        )}
      </div>
      {label && (
        <span className="text-xs text-surface-400 capitalize">{label}</span>
      )}
    </div>
  )
}

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'warning' | 'error'
  className?: string
}

const avatarSizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  status,
  className,
}) => {
  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-medium',
          'bg-gradient-to-br from-brand-500/20 to-accent-500/20',
          'border border-surface-700',
          avatarSizes[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-surface-300">{initials}</span>
        )}
      </div>
      {status && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-900',
            status === 'online' && 'bg-success-500',
            status === 'offline' && 'bg-surface-500',
            status === 'warning' && 'bg-warning-500',
            status === 'error' && 'bg-error-500'
          )}
        />
      )}
    </div>
  )
}
