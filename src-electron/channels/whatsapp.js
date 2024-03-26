import { ipcMain, dialog } from "electron";
import { create, Whatsapp } from "venom-bot"

ipcMain.handle("whatsapp:create-client", async (_) => {
  console.log('teste')
  const client = await create({
    session: process.env.USERNAME,
    catchQR: (qrCode, asciiQR) => {

    },
    logQR: false,
    folderNameToken: "tokens",
    mkdirFolderToken: "./whatsapp-config"
  })
})


ipcMain.on('CREATE_CLIENT', async (event, payload) => {
  console.log("teste CREATE_CLIENT", payload)
  const client = await create({
    session: process.env.USERNAME,
    catchQR: (qrCode, asciiQR) => {
      event.reply('QR_CODE', qrCode)
    },
    statusFind: (statusSession, session) => {
      event.reply('STATUS_SESSION', { statusSession, session })
      console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
    },
    logQR: false,
    folderNameToken: "tokens",
    mkdirFolderToken: "./whatsapp-config"
  })
  console.log(client)

})

ipcMain.handle('showOpenDialog', async (_, options) => {
  return dialog.showOpenDialog(options)
})
