import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Store,
  Music,
  Mic2,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Logo, cn } from '@dockfm/ui'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/stores', icon: Store, label: 'Negozi' },
  { to: '/playlists', icon: Music, label: 'Playlist' },
  { to: '/announcements', icon: Mic2, label: 'Annunci' },
  { to: '/scheduler', icon: Calendar, label: 'Programmazione' },
  { to: '/ai-studio', icon: Sparkles, label: 'AI Studio' },
  { to: '/analytics', icon: BarChart3, label: 'Statistiche' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Impostazioni' },
  { to: '/help', icon: HelpCircle, label: 'Aiuto' },
]

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation()

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.2 }}
      className="sidebar"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-surface-800/50">
        <Logo size="sm" showText={!collapsed} />
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800/50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'sidebar-nav-item',
                    isActive && 'active',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 nav-icon', collapsed && 'mx-auto')} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom navigation */}
      <div className="py-4 border-t border-surface-800/50">
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'sidebar-nav-item',
                    isActive && 'active',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 nav-icon', collapsed && 'mx-auto')} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="p-4 border-t border-surface-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-surface-700 flex items-center justify-center">
              <span className="text-sm font-medium text-surface-300">MR</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">
                Mario Rossi
              </p>
              <p className="text-xs text-surface-500 truncate">Admin</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  )
}
