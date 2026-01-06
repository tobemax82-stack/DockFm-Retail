// ============================================
// DOCKFM RETAIL - SHARED CONSTANTS
// ============================================

export const BUSINESS_SECTORS = {
  cafe: {
    label: 'Caffetteria',
    icon: '☕',
    defaultMood: 'morning_acoustic',
    defaultHours: { open: '06:00', close: '20:00' },
  },
  boutique: {
    label: 'Boutique',
    icon: '👗',
    defaultMood: 'lounge',
    defaultHours: { open: '10:00', close: '20:00' },
  },
  gym: {
    label: 'Palestra',
    icon: '🏋️',
    defaultMood: 'energy',
    defaultHours: { open: '06:00', close: '23:00' },
  },
  restaurant: {
    label: 'Ristorante',
    icon: '🍕',
    defaultMood: 'italian',
    defaultHours: { open: '11:00', close: '24:00' },
  },
  pharmacy: {
    label: 'Farmacia',
    icon: '🏥',
    defaultMood: 'ambient',
    defaultHours: { open: '08:00', close: '20:00' },
  },
  supermarket: {
    label: 'Supermercato',
    icon: '🛒',
    defaultMood: 'pop_hits',
    defaultHours: { open: '08:00', close: '21:00' },
  },
  hotel: {
    label: 'Hotel',
    icon: '🏨',
    defaultMood: 'lounge',
    defaultHours: { open: '00:00', close: '24:00' },
  },
  spa: {
    label: 'Spa & Wellness',
    icon: '🧘',
    defaultMood: 'ambient',
    defaultHours: { open: '09:00', close: '21:00' },
  },
  other: {
    label: 'Altro',
    icon: '🏪',
    defaultMood: 'chill',
    defaultHours: { open: '09:00', close: '19:00' },
  },
} as const

export const MOODS = {
  morning_acoustic: {
    label: 'Acoustic Morning',
    description: 'Musica acustica rilassante per la mattina',
    icon: '🌅',
    bpmRange: [60, 90],
  },
  soft_jazz: {
    label: 'Soft Jazz',
    description: 'Jazz morbido e rilassante',
    icon: '🎷',
    bpmRange: [70, 100],
  },
  lounge: {
    label: 'Lounge',
    description: 'Atmosfera elegante e sofisticata',
    icon: '🍸',
    bpmRange: [90, 110],
  },
  energy: {
    label: 'Energy',
    description: 'Musica energica e motivante',
    icon: '⚡',
    bpmRange: [120, 150],
  },
  pop_hits: {
    label: 'Pop Hits',
    description: 'Successi pop contemporanei',
    icon: '🎵',
    bpmRange: [100, 130],
  },
  ambient: {
    label: 'Ambient',
    description: 'Suoni ambientali rilassanti',
    icon: '🌿',
    bpmRange: [50, 80],
  },
  italian: {
    label: 'Italian Vibes',
    description: 'Musica italiana di atmosfera',
    icon: '🇮🇹',
    bpmRange: [80, 120],
  },
  chill: {
    label: 'Chill',
    description: 'Rilassamento e buone vibrazioni',
    icon: '😎',
    bpmRange: [80, 110],
  },
  custom: {
    label: 'Personalizzato',
    description: 'Mood personalizzato',
    icon: '🎨',
    bpmRange: [60, 150],
  },
} as const

export const ANNOUNCEMENT_TYPES = {
  promo: {
    label: 'Promozione',
    icon: '🎁',
    color: 'brand',
    defaultPriority: 5,
  },
  info: {
    label: 'Informazione',
    icon: '📢',
    color: 'accent',
    defaultPriority: 3,
  },
  closing: {
    label: 'Chiusura',
    icon: '🕐',
    color: 'warning',
    defaultPriority: 7,
  },
  emergency: {
    label: 'Emergenza',
    icon: '🚨',
    color: 'error',
    defaultPriority: 10,
  },
  weather: {
    label: 'Meteo',
    icon: '🌤️',
    color: 'accent',
    defaultPriority: 2,
  },
  custom: {
    label: 'Personalizzato',
    icon: '🎤',
    color: 'default',
    defaultPriority: 4,
  },
} as const

export const PLANS = {
  solo: {
    label: 'Solo',
    maxStores: 1,
    price: 19,
    features: [
      'Musica AI illimitata',
      'Annunci base',
      'Dashboard completa',
      'Supporto email',
    ],
  },
  chain: {
    label: 'Chain',
    maxStores: 20,
    basePrice: 49,
    pricePerStore: 15,
    features: [
      'Tutto di Solo',
      'Multi-store',
      'Scheduling avanzato',
      'Report dettagliati',
      'Supporto prioritario',
    ],
  },
  enterprise: {
    label: 'Enterprise',
    maxStores: Infinity,
    price: 'custom',
    features: [
      'Tutto di Chain',
      'Store illimitati',
      'Voce AI brandizzata',
      'API access',
      'SLA 99.9%',
      'Account manager dedicato',
    ],
  },
} as const

export const AI_VOICES = {
  'it-female-1': {
    label: 'Sofia',
    language: 'it',
    gender: 'female',
    description: 'Voce femminile italiana, professionale',
  },
  'it-male-1': {
    label: 'Marco',
    language: 'it',
    gender: 'male',
    description: 'Voce maschile italiana, calda',
  },
  'it-female-2': {
    label: 'Giulia',
    language: 'it',
    gender: 'female',
    description: 'Voce femminile italiana, giovane',
  },
  'en-female-1': {
    label: 'Emma',
    language: 'en',
    gender: 'female',
    description: 'English female voice, professional',
  },
  'en-male-1': {
    label: 'James',
    language: 'en',
    gender: 'male',
    description: 'English male voice, warm',
  },
} as const

export const CARTWALL_COLORS = {
  brand: {
    bg: 'bg-brand-500/20',
    border: 'border-brand-500/30',
    text: 'text-brand-300',
  },
  accent: {
    bg: 'bg-accent-500/20',
    border: 'border-accent-500/30',
    text: 'text-accent-300',
  },
  warning: {
    bg: 'bg-warning-500/20',
    border: 'border-warning-500/30',
    text: 'text-warning-300',
  },
  error: {
    bg: 'bg-error-500/20',
    border: 'border-error-500/30',
    text: 'text-error-300',
  },
  success: {
    bg: 'bg-success-500/20',
    border: 'border-success-500/30',
    text: 'text-success-300',
  },
} as const

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  organizations: {
    list: '/organizations',
    get: (id: string) => `/organizations/${id}`,
    create: '/organizations',
    update: (id: string) => `/organizations/${id}`,
  },
  stores: {
    list: '/stores',
    get: (id: string) => `/stores/${id}`,
    create: '/stores',
    update: (id: string) => `/stores/${id}`,
    activate: (code: string) => `/stores/activate/${code}`,
    status: (id: string) => `/stores/${id}/status`,
  },
  playlists: {
    list: '/playlists',
    get: (id: string) => `/playlists/${id}`,
    create: '/playlists',
    update: (id: string) => `/playlists/${id}`,
  },
  announcements: {
    list: '/announcements',
    get: (id: string) => `/announcements/${id}`,
    create: '/announcements',
    update: (id: string) => `/announcements/${id}`,
    generate: '/announcements/generate',
  },
  ai: {
    generateAnnouncement: '/ai/announcement',
    generateJingle: '/ai/jingle',
    generateMusic: '/ai/music',
    voices: '/ai/voices',
  },
  analytics: {
    overview: '/analytics/overview',
    stores: '/analytics/stores',
    announcements: '/analytics/announcements',
  },
} as const
