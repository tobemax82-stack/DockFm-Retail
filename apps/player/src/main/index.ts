import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { join } from 'path'
import Store from 'electron-store'

// Initialize persistent store
const store = new Store({
  defaults: {
    storeId: null,
    activationCode: null,
    volume: 70,
    isKioskMode: false,
  },
})

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Frameless for custom titlebar
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 20, y: 20 },
    backgroundColor: '#020617',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    show: false,
  })

  // Elegant fade-in when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App lifecycle
app.whenReady().then(() => {
  createWindow()

  // Register global shortcuts
  globalShortcut.register('CommandOrControl+Shift+K', () => {
    // Toggle kiosk mode
    const isKiosk = store.get('isKioskMode')
    store.set('isKioskMode', !isKiosk)
    mainWindow?.webContents.send('kiosk-mode-changed', !isKiosk)
    
    if (!isKiosk) {
      mainWindow?.setKiosk(true)
    } else {
      mainWindow?.setKiosk(false)
    }
  })

  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    app.quit()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// IPC Handlers
ipcMain.handle('store:get', (_, key: string) => {
  return store.get(key)
})

ipcMain.handle('store:set', (_, key: string, value: unknown) => {
  store.set(key, value)
})

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('app:version', () => {
  return app.getVersion()
})

ipcMain.handle('app:activate', async (_, code: string) => {
  // TODO: Validate activation code with backend
  // For now, accept any 6-digit code
  if (code.length === 6 && /^\d+$/.test(code)) {
    store.set('activationCode', code)
    store.set('storeId', `store-${code}`)
    return { success: true, storeId: `store-${code}` }
  }
  return { success: false, error: 'Codice non valido' }
})

ipcMain.handle('app:isActivated', () => {
  return !!store.get('activationCode')
})
