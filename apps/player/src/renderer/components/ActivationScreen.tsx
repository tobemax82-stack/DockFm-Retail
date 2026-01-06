import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Radio, Loader2, CheckCircle2 } from 'lucide-react'
import { Logo, Button, Input, Card } from '@dockfm/ui'

interface ActivationScreenProps {
  onActivate: (code: string) => Promise<{ success: boolean; error?: string }>
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({ onActivate }) => {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await onActivate(code)
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      setError(result.error || 'Errore di attivazione')
    }
    
    setIsLoading(false)
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
    setError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 player-container">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card variant="glass" padding="lg" className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" animated={isLoading} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-display font-bold text-surface-100 mb-2">
            Attiva il Player
          </h1>
          <p className="text-surface-400 mb-8">
            Inserisci il codice a 6 cifre dalla Dashboard
          </p>

          {/* Success state */}
          {success ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="py-8"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success-400" />
              </div>
              <p className="text-success-400 font-medium">Attivazione completata!</p>
              <p className="text-surface-500 text-sm mt-2">Caricamento in corso...</p>
            </motion.div>
          ) : (
            /* Activation form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code input */}
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  className="w-full text-center text-4xl font-mono tracking-[0.5em] py-4 px-6 rounded-2xl bg-surface-800/50 border-2 border-surface-700 text-surface-100 placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  disabled={isLoading}
                />
                
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i < code.length
                          ? 'bg-brand-500 scale-110'
                          : 'bg-surface-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-error-400 text-sm"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={code.length !== 6 || isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Attivazione...' : 'Attiva Player'}
              </Button>
            </form>
          )}

          {/* Help text */}
          <p className="text-xs text-surface-500 mt-8">
            Non hai un codice? Contatta la sede centrale o visita{' '}
            <a href="#" className="text-brand-400 hover:text-brand-300">
              dashboard.dockfm.it
            </a>
          </p>
        </Card>

        {/* Version */}
        <p className="text-center text-xs text-surface-600 mt-6">
          DockFm Retail v1.0.0
        </p>
      </motion.div>
    </div>
  )
}
