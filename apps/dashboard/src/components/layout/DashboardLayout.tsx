import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { cn } from '@dockfm/ui'

export const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="dashboard-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={cn(
          'main-content transition-all duration-200',
          sidebarCollapsed && 'main-content-collapsed'
        )}
      >
        <Outlet />
      </main>
    </div>
  )
}
