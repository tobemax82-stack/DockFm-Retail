import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TitleBar } from './components/TitleBar'
import { MainPlayer } from './components/MainPlayer'
import { Cartwall } from './components/Cartwall'
import { StatusBar } from './components/StatusBar'
import { ActivationScreen } from './components/ActivationScreen'
import { usePlayerStore } from './store/playerStore'

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { isActivated, setActivated, setStoreInfo, setKioskMode, setOnline } = usePlayerStore()

  useEffect(() => {
    // Check activation status on mount
    const checkActivation = async () => {
      try {
        if (window.electronAPI) {
          const activated = await window.electronAPI.isActivated()
          setActivated(activated)
          
          if (activated) {
            const storeId = await window.electronAPI.getStore('storeId') as string
            setStoreInfo(storeId, `Store ${storeId?.split('-')[1] || 'Demo'}`)
          }
        } else {
          // Demo mode for web preview
          setActivated(true)
          setStoreInfo('demo-001', 'Store Demo')
        }
      } catch (error) {
        console.error('Error checking activation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkActivation()

    // Listen for kiosk mode changes
    window.electronAPI?.onKioskModeChanged((isKiosk) => {
      setKioskMode(isKiosk)
    })

    // Online/offline detection
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Keyboard shortcuts for cartwall
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const { playCartwall, cartwall } = usePlayerStore.getState()
        const item = cartwall[parseInt(e.key) - 1]
        if (item) playCartwall(item.id)
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  const handleActivate = async (code: string) => {
    if (window.electronAPI) {
      return await window.electronAPI.activate(code)
    }
    // Demo mode
    return { success: true, storeId: `demo-${code}` }
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center player-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4">
            <svg className="animate-spin" viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="url(#loadingGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="80"
                strokeDashoffset="60"
              />
              <defs>
                <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p className="text-surface-400">Caricamento...</p>
        </motion.div>
      </div>
    )
  }

  // Activation screen
  if (!isActivated) {
    return <ActivationScreen onActivate={handleActivate} />
  }

  // Main player interface
  return (
    <div className="min-h-screen flex flex-col player-container">
      <TitleBar />
      
      <main className="flex-1 flex flex-col">
        <MainPlayer />
        <Cartwall />
        <StatusBar />
      </main>
    </div>
  )
}

export default App
