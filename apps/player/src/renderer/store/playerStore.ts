import { create } from 'zustand'

export interface Track {
  id: string
  title: string
  artist?: string
  duration: number
  url: string
  mood?: string
  isAnnouncement?: boolean
}

export interface CartwallItem {
  id: string
  label: string
  color: string
  track: Track
  shortcut?: string
}

interface PlayerState {
  // Playback state
  isPlaying: boolean
  currentTrack: Track | null
  currentTime: number
  volume: number
  isMuted: boolean
  
  // Queue
  queue: Track[]
  history: Track[]
  
  // Cartwall
  cartwall: CartwallItem[]
  
  // Store info
  storeId: string | null
  storeName: string | null
  isActivated: boolean
  isKioskMode: boolean
  isOnline: boolean
  
  // Actions
  play: () => void
  pause: () => void
  stop: () => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setCurrentTime: (time: number) => void
  setCurrentTrack: (track: Track | null) => void
  addToQueue: (track: Track) => void
  clearQueue: () => void
  playCartwall: (id: string) => void
  setStoreInfo: (storeId: string, storeName: string) => void
  setActivated: (activated: boolean) => void
  setKioskMode: (kiosk: boolean) => void
  setOnline: (online: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Initial state
  isPlaying: false,
  currentTrack: null,
  currentTime: 0,
  volume: 70,
  isMuted: false,
  queue: [],
  history: [],
  cartwall: [
    {
      id: '1',
      label: 'Annuncio 1',
      color: 'brand',
      shortcut: '1',
      track: {
        id: 'ann-1',
        title: 'Benvenuti nel nostro negozio',
        duration: 15,
        url: '',
        isAnnouncement: true,
      },
    },
    {
      id: '2',
      label: 'Promo',
      color: 'accent',
      shortcut: '2',
      track: {
        id: 'ann-2',
        title: 'Offerta speciale',
        duration: 20,
        url: '',
        isAnnouncement: true,
      },
    },
    {
      id: '3',
      label: 'Chiusura',
      color: 'warning',
      shortcut: '3',
      track: {
        id: 'ann-3',
        title: 'Chiusura tra 10 minuti',
        duration: 10,
        url: '',
        isAnnouncement: true,
      },
    },
    {
      id: '4',
      label: 'Emergenza',
      color: 'error',
      shortcut: '4',
      track: {
        id: 'ann-4',
        title: 'Annuncio emergenza',
        duration: 30,
        url: '',
        isAnnouncement: true,
      },
    },
  ],
  storeId: null,
  storeName: null,
  isActivated: false,
  isKioskMode: false,
  isOnline: navigator.onLine,

  // Actions
  play: () => set({ isPlaying: true }),
  
  pause: () => set({ isPlaying: false }),
  
  stop: () => set({ isPlaying: false, currentTime: 0 }),
  
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  
  toggleMute: () => {
    const { isMuted, volume } = get()
    set({ isMuted: !isMuted })
  },
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setCurrentTrack: (track) => {
    const { currentTrack, history } = get()
    if (currentTrack) {
      set({ history: [...history.slice(-19), currentTrack] })
    }
    set({ currentTrack: track, currentTime: 0 })
  },
  
  addToQueue: (track) => {
    const { queue } = get()
    set({ queue: [...queue, track] })
  },
  
  clearQueue: () => set({ queue: [] }),
  
  playCartwall: (id) => {
    const { cartwall } = get()
    const item = cartwall.find(c => c.id === id)
    if (item) {
      // TODO: Implement ducking and playing cartwall item
      console.log('Playing cartwall:', item.label)
    }
  },
  
  setStoreInfo: (storeId, storeName) => set({ storeId, storeName }),
  
  setActivated: (activated) => set({ isActivated: activated }),
  
  setKioskMode: (kiosk) => set({ isKioskMode: kiosk }),
  
  setOnline: (online) => set({ isOnline: online }),
}))
