import React from 'react'
import { Minus, Square, X } from 'lucide-react'
import { Logo, StatusIndicator } from '@dockfm/ui'
import { usePlayerStore } from '../store/playerStore'

export const TitleBar: React.FC = () => {
  const { storeName, isOnline, isKioskMode } = usePlayerStore()

  const handleMinimize = () => window.electronAPI?.minimize()
  const handleMaximize = () => window.electronAPI?.maximize()
  const handleClose = () => window.electronAPI?.close()

  return (
    <div className="drag-region h-14 flex items-center justify-between px-4 bg-surface-900/50 backdrop-blur-xl border-b border-surface-800/50">
      {/* Left: Logo */}
      <div className="flex items-center gap-4 no-drag">
        <Logo size="sm" showText={true} />
        {storeName && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/50 border border-surface-700/50">
            <span className="text-sm text-surface-300">{storeName}</span>
          </div>
        )}
      </div>

      {/* Center: Status */}
      <div className="flex items-center gap-4">
        <StatusIndicator 
          status={isOnline ? 'online' : 'offline'} 
          label={isOnline ? 'Connesso' : 'Offline'}
          pulse={isOnline}
        />
        {isKioskMode && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-warning-500/20 border border-warning-500/30">
            <div className="w-2 h-2 bg-warning-500 rounded-full animate-pulse" />
            <span className="text-xs text-warning-400">Modalità Kiosk</span>
          </div>
        )}
      </div>

      {/* Right: Window controls (hidden in kiosk mode) */}
      {!isKioskMode && (
        <div className="flex items-center gap-1 no-drag">
          <button
            onClick={handleMinimize}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-700/50 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-700/50 transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-surface-400 hover:text-error-400 hover:bg-error-500/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
