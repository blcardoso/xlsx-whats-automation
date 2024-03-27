const { randomTimer } = require('../utils')
const { ipcMain, dialog } = require("electron");
const { create } = require('venom-bot')
const moment = require('moment-timezone')
import fs from 'fs'
let whatsapp

ipcMain.on('CREATE_CLIENT', async (event) => {
  try {
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
      updatesLog: true
    })
    console.log('create', whatsapp)
  } catch (error) {
    console.log("ERRO", error)
  }
})

ipcMain.on('SEND_MESSAGES', async (event, payload) => {
  var messagesSent = []

  for (const msg of payload) {
        const timer = randomTimer()
        console.log("Enviando mensagem em " + (timer / 1000) + " segundos...")

    try {
    await new Promise((resolve, reject) => {
      setTimeout((_) => {
        whatsapp.checkNumberStatus(msg.number)
          .then(() => {
            if (!msg.image && fs.existsSync(msg.image)) {
              whatsapp.sendText(msg.number, msg.message)
                .then(() => resolve())
                .catch((err) => reject(err.message))
            } else {
              whatsapp.sendImage(
                msg.number,
                msg.image,
                "image",
                msg.message
              )
                .then(() => resolve())
                .catch((err) => reject(err.message))
            }
          })
          .catch(_ => reject('Número inválido'))
      }, timer)
    })

      console.log("Mensagem enviada para o número: " + msg.number.replace('@c.us', ''))

      messagesSent.push({
        phone: msg.number.replace('@c.us', ''),
        status: 'Sucesso',
        last_sent: moment().tz("America/Sao_Paulo").format('DD/MM/YYYY HH:mm:ss')
      })
    } catch (err) {
      console.log("Erro ao enviar mensagem para o número: " + msg.number.replace('@c.us', ''))

      messagesSent.push({
        phone: msg.number.replace('@c.us', ''),
        status: err,
        last_sent: moment().tz("America/Sao_Paulo").format('DD/MM/YYYY HH:mm:ss')
      })
    }
  }
     event.reply('WRITE_XLSX', messagesSent)
})

ipcMain.handle('showOpenDialog', async (_, options) => {
  return dialog.showOpenDialog(options)
})
