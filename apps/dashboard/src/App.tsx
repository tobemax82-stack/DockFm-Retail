import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'

// Placeholder pages
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
        <Route path="/stores" element={<PlaceholderPage title="Negozi" />} />
        <Route path="/playlists" element={<PlaceholderPage title="Playlist" />} />
        <Route path="/announcements" element={<PlaceholderPage title="Annunci" />} />
        <Route path="/scheduler" element={<PlaceholderPage title="Programmazione" />} />
        <Route path="/ai-studio" element={<PlaceholderPage title="AI Studio" />} />
        <Route path="/analytics" element={<PlaceholderPage title="Statistiche" />} />
        <Route path="/settings" element={<PlaceholderPage title="Impostazioni" />} />
        <Route path="/help" element={<PlaceholderPage title="Aiuto" />} />
      </Route>
    </Routes>
  )
}

export default App
