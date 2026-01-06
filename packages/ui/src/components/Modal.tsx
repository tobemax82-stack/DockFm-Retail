import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw] max-h-[90vh]',
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-surface-950/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
              'w-full p-6',
              sizeClasses[size]
            )}
          >
            <div className="glass-strong rounded-3xl p-6 shadow-2xl">
              {/* Header */}
              {(title || showClose) && (
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {title && (
                      <h2 className="text-xl font-semibold text-surface-100">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-surface-400">
                        {description}
                      </p>
                    )}
                  </div>
                  {showClose && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="text-surface-400 hover:text-surface-100"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}

              {/* Content */}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  position?: 'left' | 'right'
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
}) => {
  const slideFrom = position === 'right' ? 'translateX(100%)' : 'translateX(-100%)'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-surface-950/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ transform: slideFrom }}
            animate={{ transform: 'translateX(0)' }}
            exit={{ transform: slideFrom }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'fixed top-0 bottom-0 z-50 w-full max-w-md',
              'glass-strong border-surface-700',
              position === 'right' ? 'right-0 border-l' : 'left-0 border-r'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-700/50">
              {title && (
                <h2 className="text-lg font-semibold text-surface-100">{title}</h2>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-surface-400 hover:text-surface-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
