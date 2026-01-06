import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Store
  getStore: (key: string) => ipcRenderer.invoke('store:get', key),
  setStore: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value),
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  
  // App
  getVersion: () => ipcRenderer.invoke('app:version'),
  activate: (code: string) => ipcRenderer.invoke('app:activate', code),
  isActivated: () => ipcRenderer.invoke('app:isActivated'),
  
  // Events
  onKioskModeChanged: (callback: (isKiosk: boolean) => void) => {
    ipcRenderer.on('kiosk-mode-changed', (_, isKiosk) => callback(isKiosk))
  },
})

// Type definitions for renderer
export interface ElectronAPI {
  getStore: (key: string) => Promise<unknown>
  setStore: (key: string, value: unknown) => Promise<void>
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
  getVersion: () => Promise<string>
  activate: (code: string) => Promise<{ success: boolean; storeId?: string; error?: string }>
  isActivated: () => Promise<boolean>
  onKioskModeChanged: (callback: (isKiosk: boolean) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
