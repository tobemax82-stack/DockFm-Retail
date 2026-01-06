import React from 'react'
import { cn } from '../lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  variant = 'default',
  size = 'md',
  showLabel = false,
  animated = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const variantClasses = {
    default: 'bg-brand-500',
    gradient: 'bg-gradient-to-r from-brand-500 to-accent-400',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full rounded-full bg-surface-700 overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantClasses[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-surface-400 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  children,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-surface-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

interface VolumeSliderProps {
  value: number
  onChange: (value: number) => void
  className?: string
  vertical?: boolean
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  value,
  onChange,
  className,
  vertical = false,
}) => {
  return (
    <div
      className={cn(
        'relative',
        vertical ? 'h-32 w-2' : 'w-full h-2',
        className
      )}
    >
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'absolute appearance-none bg-transparent cursor-pointer',
          vertical
            ? 'h-32 w-2 -rotate-90 origin-left translate-y-full'
            : 'w-full h-2'
        )}
        style={{
          background: `linear-gradient(to ${vertical ? 'top' : 'right'}, 
            #6366f1 0%, 
            #06b6d4 ${value}%, 
            rgba(51, 65, 85, 0.5) ${value}%, 
            rgba(51, 65, 85, 0.5) 100%)`,
          borderRadius: '9999px',
        }}
      />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #06b6d4);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #06b6d4);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}
