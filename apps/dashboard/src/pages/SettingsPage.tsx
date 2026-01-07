import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Globe,
  Volume2,
  Music,
  CreditCard,
  Key,
  Users,
  Mail,
  Phone,
  MapPin,
  Save,
  Camera,
  ChevronRight,
  Check,
  AlertTriangle,
  Info,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Card, Badge, Button, Input, Modal, cn } from '@dockfm/ui'
import { Header } from '../components/layout/Header'

// Settings sections
const settingsSections = [
  { id: 'profile', label: 'Profilo', icon: User },
  { id: 'organization', label: 'Organizzazione', icon: Building2 },
  { id: 'notifications', label: 'Notifiche', icon: Bell },
  { id: 'audio', label: 'Audio Defaults', icon: Volume2 },
  { id: 'security', label: 'Sicurezza', icon: Shield },
  { id: 'team', label: 'Team & Ruoli', icon: Users },
  { id: 'billing', label: 'Abbonamento', icon: CreditCard },
  { id: 'api', label: 'API & Integrazioni', icon: Key },
]

// Profile section component
const ProfileSection: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: 'Mario',
    lastName: 'Rossi',
    email: 'mario.rossi@dockfm.com',
    phone: '+39 02 1234567',
    role: 'Admin',
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-100 mb-2">Profilo Utente</h3>
        <p className="text-sm text-surface-400">Gestisci le tue informazioni personali</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-6 p-6 rounded-xl bg-surface-900/30 border border-surface-800/50">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-surface-700 flex items-center justify-center">
            <span className="text-3xl font-bold text-surface-300">MR</span>
          </div>
          <button className="absolute -bottom-2 -right-2 p-2 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-surface-100">{formData.firstName} {formData.lastName}</h4>
          <p className="text-surface-400">{formData.email}</p>
          <Badge variant="secondary" className="mt-2">{formData.role}</Badge>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">Nome</label>
          <Input
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">Cognome</label>
          <Input
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">Telefono</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Salva modifiche
        </Button>
      </div>
    </div>
  )
}

// Organization section component
const OrganizationSection: React.FC = () => {
  const [orgData, setOrgData] = useState({
    name: 'DockFm Demo Corp',
    industry: 'retail',
    stores: 12,
    address: 'Via Roma 123, 20121 Milano',
    vatNumber: 'IT12345678901',
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-100 mb-2">Organizzazione</h3>
        <p className="text-sm text-surface-400">Informazioni sulla tua azienda</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-surface-300 mb-2">Nome Azienda</label>
          <Input
            value={orgData.name}
            onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">Settore</label>
          <select
            value={orgData.industry}
            onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
            className="w-full p-3 rounded-xl bg-surface-900/50 border border-surface-800/50 text-surface-200 focus:outline-none focus:border-brand-500/50"
          >
            <option value="retail">Retail</option>
            <option value="hospitality">Hospitality</option>
            <option value="fitness">Fitness</option>
            <option value="healthcare">Healthcare</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">P.IVA</label>
          <Input
            value={orgData.vatNumber}
            onChange={(e) => setOrgData({ ...orgData, vatNumber: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-surface-300 mb-2">Indirizzo</label>
          <Input
            value={orgData.address}
            onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
          />
        </div>
      </div>

      <Card variant="glass" className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/20">
              <Building2 className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="font-medium text-surface-200">Negozi attivi</p>
              <p className="text-sm text-surface-400">{orgData.stores} punti vendita collegati</p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            Gestisci
          </Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Salva modifiche
        </Button>
      </div>
    </div>
  )
}

// Notifications section component
const NotificationsSection: React.FC = () => {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: true,
    storeOffline: true,
    volumeAnomaly: true,
    scheduleChanges: false,
    weeklyReport: true,
    newFeatures: false,
  })

  const NotificationToggle: React.FC<{
    label: string
    description: string
    checked: boolean
    onChange: (checked: boolean) => void
  }> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/30 border border-surface-800/50">
      <div>
        <p className="font-medium text-surface-200">{label}</p>
        <p className="text-sm text-surface-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'w-12 h-6 rounded-full transition-colors relative',
          checked ? 'bg-brand-500' : 'bg-surface-700'
        )}
      >
        <div
          className={cn(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
            checked ? 'left-7' : 'left-1'
          )}
        />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-100 mb-2">Notifiche</h3>
        <p className="text-sm text-surface-400">Gestisci come ricevere gli aggiornamenti</p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-surface-300">Canali</h4>
        <NotificationToggle
          label="Notifiche Email"
          description="Ricevi aggiornamenti via email"
          checked={notifications.emailAlerts}
          onChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
        />
        <NotificationToggle
          label="Notifiche Push"
          description="Notifiche in tempo reale nel browser"
          checked={notifications.pushAlerts}
          onChange={(checked) => setNotifications({ ...notifications, pushAlerts: checked })}
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-surface-300">Eventi</h4>
        <NotificationToggle
          label="Negozio Offline"
          description="Avviso quando un negozio va offline"
          checked={notifications.storeOffline}
          onChange={(checked) => setNotifications({ ...notifications, storeOffline: checked })}
        />
        <NotificationToggle
          label="Anomalie Volume"
          description="Avviso per volumi anomali"
          checked={notifications.volumeAnomaly}
          onChange={(checked) => setNotifications({ ...notifications, volumeAnomaly: checked })}
        />
        <NotificationToggle
          label="Modifiche Palinsesto"
          description="Notifica cambi alla programmazione"
          checked={notifications.scheduleChanges}
          onChange={(checked) => setNotifications({ ...notifications, scheduleChanges: checked })}
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-surface-300">Report</h4>
        <NotificationToggle
          label="Report Settimanale"
          description="Riepilogo statistiche ogni lunedì"
          checked={notifications.weeklyReport}
          onChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
        />
        <NotificationToggle
          label="Nuove Funzionalità"
          description="Aggiornamenti su nuove feature"
          checked={notifications.newFeatures}
          onChange={(checked) => setNotifications({ ...notifications, newFeatures: checked })}
        />
      </div>
    </div>
  )
}

// Audio defaults section
const AudioDefaultsSection: React.FC = () => {
  const [defaults, setDefaults] = useState({
    defaultVolume: 70,
    maxVolume: 85,
    fadeTime: 3,
    announcementDucking: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-100 mb-2">Impostazioni Audio</h3>
        <p className="text-sm text-surface-400">Valori predefiniti per tutti i negozi</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-surface-300">Volume predefinito</label>
            <span className="text-sm text-brand-400">{defaults.defaultVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={defaults.defaultVolume}
            onChange={(e) => setDefaults({ ...defaults, defaultVolume: parseInt(e.target.value) })}
            className="w-full accent-brand-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-surface-300">Volume massimo</label>
            <span className="text-sm text-brand-400">{defaults.maxVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={defaults.maxVolume}
            onChange={(e) => setDefaults({ ...defaults, maxVolume: parseInt(e.target.value) })}
            className="w-full accent-brand-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-surface-300">Dissolvenza (secondi)</label>
            <span className="text-sm text-brand-400">{defaults.fadeTime}s</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={defaults.fadeTime}
            onChange={(e) => setDefaults({ ...defaults, fadeTime: parseInt(e.target.value) })}
            className="w-full accent-brand-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-surface-300">Ducking annunci</label>
            <span className="text-sm text-brand-400">{defaults.announcementDucking}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={defaults.announcementDucking}
            onChange={(e) => setDefaults({ ...defaults, announcementDucking: parseInt(e.target.value) })}
            className="w-full accent-brand-500"
          />
          <p className="text-xs text-surface-500 mt-1">
            Riduzione volume musica durante gli annunci
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Salva modifiche
        </Button>
      </div>
    </div>
  )
}

// Security section
const SecuritySection: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-100 mb-2">Sicurezza</h3>
        <p className="text-sm text-surface-400">Proteggi il tuo account</p>
      </div>

      {/* Password change */}
      <Card variant="glass" className="p-6">
        <h4 className="font-medium text-surface-200 mb-4">Cambia Password</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Password attuale
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Nuova password
            </label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Conferma password
            </label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button variant="secondary">Aggiorna Password</Button>
        </div>
      </Card>

      {/* 2FA */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success-500/20">
              <Shield className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <h4 className="font-medium text-surface-200">Autenticazione a due fattori</h4>
              <p className="text-sm text-surface-400">Aggiungi un livello extra di sicurezza</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-success-500/20 text-success-400">
            Attivo
          </Badge>
        </div>
      </Card>

      {/* Sessions */}
      <Card variant="glass" className="p-6">
        <h4 className="font-medium text-surface-200 mb-4">Sessioni attive</h4>
        <div className="space-y-3">
          {[
            { device: 'MacBook Pro', location: 'Milano, IT', current: true },
            { device: 'iPhone 15', location: 'Milano, IT', current: false },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-800/30">
              <div>
                <p className="text-sm text-surface-200">{session.device}</p>
                <p className="text-xs text-surface-500">{session.location}</p>
              </div>
              {session.current ? (
                <Badge variant="secondary" size="sm">Corrente</Badge>
              ) : (
                <Button variant="ghost" size="sm" className="text-error-400">
                  Disconnetti
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// Team section
const TeamSection: React.FC = () => {
  const teamMembers = [
    { id: '1', name: 'Mario Rossi', email: 'mario@dockfm.com', role: 'Admin', avatar: 'MR' },
    { id: '2', name: 'Laura Bianchi', email: 'laura@dockfm.com', role: 'Manager', avatar: 'LB' },
    { id: '3', name: 'Giuseppe Verdi', email: 'giuseppe@dockfm.com', role: 'Viewer', avatar: 'GV' },
  ]

  const roleColors = {
    Admin: 'bg-brand-500/20 text-brand-400',
    Manager: 'bg-accent-500/20 text-accent-400',
    Viewer: 'bg-surface-700/50 text-surface-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">Team & Ruoli</h3>
          <p className="text-sm text-surface-400">Gestisci gli accessi del tuo team</p>
        </div>
        <Button>
          <Users className="w-4 h-4 mr-2" />
          Invita utente
        </Button>
      </div>

      {/* Role legend */}
      <div className="flex gap-4 p-4 rounded-xl bg-surface-900/30 border border-surface-800/50">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" size="sm" className={roleColors.Admin}>Admin</Badge>
          <span className="text-xs text-surface-400">Accesso completo</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" size="sm" className={roleColors.Manager}>Manager</Badge>
          <span className="text-xs text-surface-400">Gestione negozi</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" size="sm" className={roleColors.Viewer}>Viewer</Badge>
          <span className="text-xs text-surface-400">Solo lettura</span>
        </div>
      </div>

      {/* Team list */}
      <div className="space-y-3">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 rounded-xl bg-surface-900/30 border border-surface-800/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-surface-700 flex items-center justify-center">
                <span className="text-sm font-medium text-surface-300">{member.avatar}</span>
              </div>
              <div>
                <p className="font-medium text-surface-200">{member.name}</p>
                <p className="text-sm text-surface-400">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className={roleColors[member.role as keyof typeof roleColors]}>
                {member.role}
              </Badge>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Billing section
const BillingSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-surface-100 mb-2">Abbonamento</h3>
        <p className="text-sm text-surface-400">Gestisci il tuo piano e la fatturazione</p>
      </div>

      {/* Current plan */}
      <Card variant="gradient" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="secondary" className="bg-white/20 text-white mb-2">Piano Attivo</Badge>
            <h4 className="text-2xl font-bold text-white">Chain Pro</h4>
            <p className="text-white/70">12 negozi • €229/mese</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-sm">Prossimo rinnovo</p>
            <p className="text-white font-medium">15 Febbraio 2024</p>
          </div>
        </div>
      </Card>

      {/* Usage */}
      <Card variant="glass" className="p-6">
        <h4 className="font-medium text-surface-200 mb-4">Utilizzo corrente</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-surface-400">Negozi</span>
              <span className="text-sm text-surface-200">12 / 20</span>
            </div>
            <div className="h-2 rounded-full bg-surface-800 overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-surface-400">Storage audio</span>
              <span className="text-sm text-surface-200">2.4 GB / 10 GB</span>
            </div>
            <div className="h-2 rounded-full bg-surface-800 overflow-hidden">
              <div className="h-full bg-accent-500 rounded-full" style={{ width: '24%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-surface-400">Generazioni AI</span>
              <span className="text-sm text-surface-200">45 / 100</span>
            </div>
            <div className="h-2 rounded-full bg-surface-800 overflow-hidden">
              <div className="h-full bg-success-500 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1">
          Cambia Piano
        </Button>
        <Button variant="secondary" className="flex-1">
          Storico Fatture
        </Button>
      </div>
    </div>
  )
}

export const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile')

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />
      case 'organization':
        return <OrganizationSection />
      case 'notifications':
        return <NotificationsSection />
      case 'audio':
        return <AudioDefaultsSection />
      case 'security':
        return <SecuritySection />
      case 'team':
        return <TeamSection />
      case 'billing':
        return <BillingSection />
      default:
        return <ProfileSection />
    }
  }

  return (
    <>
      <Header
        title="Impostazioni"
        subtitle="Configura il tuo account e le preferenze"
      />

      <div className="p-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                    activeSection === section.id
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                  )}
                >
                  <section.icon className="w-5 h-5" />
                  <span>{section.label}</span>
                  {activeSection === section.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <Card variant="glass" className="p-8">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderSection()}
              </motion.div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
