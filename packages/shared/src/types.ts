// ============================================
// DOCKFM RETAIL - SHARED TYPES
// ============================================

// ============================================
// USER & AUTH
// ============================================
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'operator'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  organizationId: string
  storeIds?: string[] // For managers: which stores they can access
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// ORGANIZATION (TENANT)
// ============================================
export type BusinessSector = 
  | 'cafe'
  | 'boutique'
  | 'gym'
  | 'restaurant'
  | 'pharmacy'
  | 'supermarket'
  | 'hotel'
  | 'spa'
  | 'other'

export type MusicLicenseType = 'royalty_free' | 'commercial'

export interface Organization {
  id: string
  name: string
  sector: BusinessSector
  logo?: string
  primaryColor?: string
  musicLicense: MusicLicenseType
  hasSIAE: boolean // Only relevant if musicLicense is 'commercial'
  plan: 'solo' | 'chain' | 'enterprise'
  maxStores: number
  settings: OrganizationSettings
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationSettings {
  defaultVolume: number
  defaultMood: string
  enableWeather: boolean
  enableAIAnnouncements: boolean
  timezone: string
  language: string
  brandedVoice?: string // AI voice ID for branded announcements
}

// ============================================
// STORE
// ============================================
export type StoreStatus = 'online' | 'offline' | 'warning' | 'error'

export interface Store {
  id: string
  organizationId: string
  name: string
  address: string
  city: string
  timezone: string
  activationCode: string
  status: StoreStatus
  lastSeen?: Date
  settings: StoreSettings
  schedule: StoreSchedule
  createdAt: Date
  updatedAt: Date
}

export interface StoreSettings {
  volume: number
  currentMood?: string
  currentPlaylistId?: string
  fallbackPlaylistId?: string
  isKioskMode: boolean
  screenProtected: boolean
}

export interface StoreSchedule {
  openingHours: {
    [key: string]: { // 'monday', 'tuesday', etc.
      open: string   // '09:00'
      close: string  // '20:00'
      closed?: boolean
    }
  }
}

// ============================================
// PLAYER STATE (Real-time)
// ============================================
export interface PlayerState {
  storeId: string
  isPlaying: boolean
  currentTrack?: Track
  currentTime: number
  volume: number
  isMuted: boolean
  mood?: string
  isOnline: boolean
  lastUpdate: Date
}

// ============================================
// MUSIC & PLAYLISTS
// ============================================
export type MoodType = 
  | 'morning_acoustic'
  | 'soft_jazz'
  | 'lounge'
  | 'energy'
  | 'pop_hits'
  | 'ambient'
  | 'italian'
  | 'chill'
  | 'custom'

export interface Track {
  id: string
  title: string
  artist?: string
  album?: string
  duration: number // seconds
  url: string
  mood?: MoodType
  bpm?: number
  isAI: boolean // AI-generated track
  isAnnouncement: boolean
  organizationId?: string // null for global tracks
  createdAt: Date
}

export interface Playlist {
  id: string
  organizationId: string
  name: string
  description?: string
  mood?: MoodType
  trackIds: string[]
  duration: number // total seconds
  isAI: boolean // AI-generated playlist
  isDefault: boolean
  coverUrl?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// ANNOUNCEMENTS
// ============================================
export type AnnouncementType = 
  | 'promo'
  | 'info'
  | 'closing'
  | 'emergency'
  | 'weather'
  | 'custom'

export type AnnouncementStatus = 'draft' | 'active' | 'scheduled' | 'expired'

export interface Announcement {
  id: string
  organizationId: string
  name: string
  type: AnnouncementType
  text: string // The announcement text (for AI generation)
  audioUrl?: string // Pre-recorded or AI-generated audio
  voiceId?: string // AI voice ID used
  duration: number
  status: AnnouncementStatus
  priority: number // 1-10, higher = more important
  storeIds?: string[] // null = all stores
  createdAt: Date
  updatedAt: Date
}

// ============================================
// SCHEDULER
// ============================================
export type ScheduleType = 'playlist' | 'announcement' | 'mood'

export interface ScheduleRule {
  id: string
  organizationId: string
  name: string
  type: ScheduleType
  targetId: string // playlistId, announcementId, or mood name
  storeIds?: string[] // null = all stores
  schedule: {
    type: 'daily' | 'weekly' | 'specific_date' | 'interval'
    time?: string // '14:30'
    days?: string[] // ['monday', 'wednesday']
    date?: string // '2024-12-25'
    interval?: number // minutes between plays
  }
  priority: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================
// CARTWALL
// ============================================
export interface CartwallItem {
  id: string
  organizationId: string
  storeId?: string // null = available to all stores
  label: string
  shortcut?: string // '1', '2', etc.
  color: 'brand' | 'accent' | 'warning' | 'error' | 'success'
  announcementId: string
  order: number
}

// ============================================
// ANALYTICS
// ============================================
export interface PlaybackLog {
  id: string
  storeId: string
  trackId?: string
  announcementId?: string
  playedAt: Date
  duration: number
  completed: boolean
}

export interface StoreAnalytics {
  storeId: string
  date: Date
  totalPlaytime: number // seconds
  tracksPlayed: number
  announcementsPlayed: number
  avgVolume: number
  onlineTime: number // seconds
  offlineTime: number // seconds
}

// ============================================
// AI GENERATION
// ============================================
export interface AIGenerationRequest {
  type: 'announcement' | 'jingle' | 'promo'
  text?: string
  mood?: string
  voiceId?: string
  language: string
  duration?: number // target duration in seconds
}

export interface AIGenerationResult {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  audioUrl?: string
  duration?: number
  error?: string
  createdAt: Date
  completedAt?: Date
}

// ============================================
// API RESPONSES
// ============================================
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
