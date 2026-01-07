import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'
import { StoresPage } from './pages/StoresPage'
import { PlaylistsPage } from './pages/PlaylistsPage'
import { AnnouncementsPage } from './pages/AnnouncementsPage'
import { SchedulerPage } from './pages/SchedulerPage'
import { AIStudioPage } from './pages/AIStudioPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SettingsPage } from './pages/SettingsPage'

// Placeholder for help page
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-surface-100">{title}</h1>
    <p className="text-surface-400 mt-2">Pagina in costruzione...</p>
  </div>
)

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/scheduler" element={<SchedulerPage />} />
        <Route path="/ai-studio" element={<AIStudioPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<PlaceholderPage title="Aiuto" />} />
      </Route>
    </Routes>
  )
}

export default App
