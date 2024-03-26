import { ipcMain, dialog } from "electron";
import { create } from "venom-bot"
import randomTimer from '../utils'

global.client = null

ipcMain.on('CREATE_CLIENT', async (event) => {
  global.client = await create({
    disableSpins: true,
    disableWelcome: true,
    debug: true,
    headless: true,
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
  })
})

ipcMain.on('SEND_MESSAGES', async (event, payload) => {
  for (const msg of payload) {
    try {
        const timer = randomTimer()
        console.log("Enviando mensagem em " + (timer / 1000) + " segundos...")

        await new Promise((resolve, reject) => {
          console.log(msg)
            setTimeout((_) => {
                if (!msg.image) {
                    global.client.sendText(msg.number, msg.message)
                        .then(resolve)
                        .catch(reject)
                } else {
                  global.client.sendImage(
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
    }
  }
})

ipcMain.handle('showOpenDialog', async (_, options) => {
  return dialog.showOpenDialog(options)
})
