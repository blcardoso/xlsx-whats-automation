import { contextBridge, ipcRenderer } from 'electron'
const validChannels = [
  "CREATE_CLIENT",
  "QR_CODE",
  "STATUS_SESSION"
]
contextBridge.exposeInMainWorld('whatsapp', {
  createClient: () => ipcRenderer.invoke("whatsapp:create-client"),
  showOpenDialog: (...args) => ipcRenderer.invoke('showOpenDialog', ...args),
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      console.log('teste send', channel, data)
      ipcRenderer.send(channel, data)
    }
  },
  on: (channel, func) => {
    if (validChannels.includes(channel)) {
      console.log('teste on', channel, func)
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})


