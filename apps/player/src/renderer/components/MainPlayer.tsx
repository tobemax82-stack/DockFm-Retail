import React from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react'
import { AudioVisualizer, VolumeSlider, cn } from '@dockfm/ui'
import { usePlayerStore } from '../store/playerStore'

export const MainPlayer: React.FC = () => {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    volume,
    isMuted,
    play,
    pause,
    stop,
    setVolume,
    toggleMute,
  } = usePlayerStore()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = currentTrack 
    ? (currentTime / currentTrack.duration) * 100 
    : 0

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      {/* Now Playing Info */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Album art / Visualizer */}
        <div className="album-art-container w-64 h-64 mx-auto mb-8 rounded-3xl overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 backdrop-blur-xl border border-surface-700/50 flex items-center justify-center">
            <AudioVisualizer 
              isPlaying={isPlaying} 
              barCount={7} 
              variant="default"
              className="h-32"
            />
          </div>
        </div>

        {/* Track info */}
        <div className="track-info max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-surface-100 mb-2 truncate">
            {currentTrack?.title || 'Nessun brano in riproduzione'}
          </h2>
          <p className="text-surface-400">
            {currentTrack?.artist || currentTrack?.mood || 'DockFm Retail'}
          </p>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-accent-400 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-surface-500">
          <span className="time-glow font-mono">{formatTime(currentTime)}</span>
          <span className="font-mono">{currentTrack ? formatTime(currentTrack.duration) : '0:00'}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-6 mb-12">
        {/* Stop */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={stop}
          className="player-button-secondary w-16 h-16 glass border-surface-600 rounded-full"
        >
          <Square className="w-6 h-6 text-surface-300" />
        </motion.button>

        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isPlaying ? pause : play}
          className="play-button-glow w-24 h-24 bg-gradient-brand rounded-full flex items-center justify-center shadow-glow"
        >
          {isPlaying ? (
            <Pause className="w-10 h-10 text-white" />
          ) : (
            <Play className="w-10 h-10 text-white ml-1" />
          )}
        </motion.button>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className="player-button-secondary w-16 h-16 glass border-surface-600 rounded-full"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-6 h-6 text-surface-300" />
            ) : (
              <Volume2 className="w-6 h-6 text-surface-300" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Volume Slider */}
      <div className="w-full max-w-xs">
        <div className="flex items-center gap-4">
          <VolumeX className="w-4 h-4 text-surface-500" />
          <div className="flex-1 volume-shine">
            <VolumeSlider 
              value={isMuted ? 0 : volume} 
              onChange={setVolume}
            />
          </div>
          <Volume2 className="w-4 h-4 text-surface-500" />
        </div>
        <div className="text-center mt-2">
          <span className="text-sm text-surface-400 font-mono">{isMuted ? 0 : volume}%</span>
        </div>
      </div>
    </div>
  )
}
