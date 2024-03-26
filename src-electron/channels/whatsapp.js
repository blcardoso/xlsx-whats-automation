const { randomTimer } = require('../utils')
const { ipcMain, dialog } = require("electron");
const { create } = require('venom-bot')

let whatsapp = null

ipcMain.on('CREATE_CLIENT', async (event) => {
  whatsapp = await create({
    disableSpins: true,
    disableWelcome: true,
    headless: 'new',
    session: process.env.USERNAME,
    catchQR: (qrCode) => {
      event.reply('QR_CODE', qrCode)
    },
    statusFind: (statusSession, session) => {
      event.reply('STATUS_SESSION', { statusSession, session })
    },
    folderNameToken: "tokens",
    mkdirFolderToken: "./whatsapp-config",
    createPathFileToken: true,
    forceConnect: true,
    waitForLogin: true,
    updatesLog: true
  })
})

ipcMain.on('SEND_MESSAGES', async (event, payload) => {
  // if (!whatsapp) {
  //   event.reply('CLIENT_NOT_INITIALIZED')
  //   return
  // }
  
  for (const msg of payload) {
    try {
        const timer = randomTimer()
        console.log("Enviando mensagem em " + (timer / 1000) + " segundos...")

        await new Promise((resolve, reject) => {
          console.log(msg)
            setTimeout((_) => {
                if (!msg.image) {
                  whatsapp.sendText(msg.number, msg.message)
                        .then(resolve)
                        .catch(reject)
                } else {
                  whatsapp.sendImage(
                        msg.number,
                        msg.image,
                        "image",
                        msg.message
                    )
                        .then(resolve)
                        .catch(reject)
                }
            }, timer)
        })
        console.log("Mensagem enviada para o número: " + msg.number)
    } catch (e) {
        console.log("Error ao enviar mensagem para o número: " + msg.number)
        console.log(e)
    } finally {
      event.reply('END_AUTOMATION')
    }
  }
})

ipcMain.handle('showOpenDialog', async (_, options) => {
  return dialog.showOpenDialog(options)
})
