import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

// Use createRequire to import CommonJS modules
const require = createRequire(import.meta.url)

// Import electron as CommonJS
const { app, BrowserWindow } = require('electron') as any

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const url = process.env.VITE_DEV_SERVER_URL
  if (url) {
    win.loadURL(url)
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  win.webContents.on('did-finish-load', () => {
    // Page loaded
  })

  win.webContents.on('did-fail-load', (event: any, errorCode: number, errorDescription: string) => {
    // Handle load error silently
  })

  return win
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
