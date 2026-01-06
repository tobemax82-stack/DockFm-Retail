import React from 'react'
import { Bell, Search, Plus } from 'lucide-react'
import { Button, Input, Badge } from '@dockfm/ui'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, action }) => {
  return (
    <header className="page-header">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-surface-400 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Cerca..."
              className="w-64 pl-10"
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-surface-400 hover:text-surface-100 hover:bg-surface-800/50 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
          </button>

          {/* Main action */}
          {action && (
            <Button onClick={action.onClick}>
              <Plus className="w-4 h-4" />
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
