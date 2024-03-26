import { ipcMain } from "electron";
import { create } from "venom-bot"

var whatsapp = null

ipcMain.on('CREATE_CLIENT', async (event, payload) => {
  await create({
    session: process.env.USERNAME,
    catchQR: (qrCode, asciiQR) => {
      event.reply('QR_CODE', qrCode)
    },
    logQR: false,
    folderNameToken: "tokens",
    mkdirFolderToken: "./whatsapp-config"
  }).then(client => {
    whatsapp = client
    event.reply('CONNECTION_SUCCESSFUL')
  })
})
