import { contextBridge, ipcRenderer } from 'electron'
const validChannels = [
  "CREATE_CLIENT",
  "QR_CODE",
  "STATUS_SESSION",
  "CONNECTION_SUCCESSFUL",
  "MESSAGES",
  "READ_FILE",
  "SEND_MESSAGES"
]

contextBridge.exposeInMainWorld('whatsapp', {
  showOpenDialog: (...args) => ipcRenderer.invoke('showOpenDialog', ...args),
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  on: (channel, func) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})

contextBridge.exposeInMainWorld('xlsx', {
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  on: (channel, func) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})


