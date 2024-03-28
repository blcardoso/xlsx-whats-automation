import { contextBridge, ipcRenderer } from 'electron'
const validChannels = [
  "QR_CODE",
  "STATUS_SESSION",
  "CONNECTION_SUCCESSFUL",
  "READ_FILE",
  "SEND_MESSAGES",
  "CLOSE_SESSION",
  "SESSION_CLOSED",
  "SESSION_CLOSE_ERROR"
]

contextBridge.exposeInMainWorld('whatsapp', {
  showOpenDialog: (...args) => ipcRenderer.invoke('showOpenDialog', ...args),
  sendMessages: (payload) => ipcRenderer.invoke('SEND_MESSAGES', payload),
  writeXlsx: (payload) => ipcRenderer.invoke('WRITE_XLSX', payload),
  createClient: () => ipcRenderer.send('CREATE_CLIENT'),
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


