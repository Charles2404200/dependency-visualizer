const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('API', {
  ping: () => console.log('ping from preload')
})
