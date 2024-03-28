const { randomTimer } = require('../utils')
const { ipcMain, dialog } = require("electron");
const { create } = require('venom-bot')
const moment = require('moment-timezone')
import fs from 'fs'
let whatsapp

ipcMain.on('CREATE_CLIENT', async (event) => {
  try {
    console.log('CREATE_CLIENT')
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
    console.log('CREATE_CLIENT', whatsapp)
  } catch (error) {
    console.log("ERRO", error)
  }
})

ipcMain.handle('SEND_MESSAGES', async (event, payload) => {
  const messagesSent = []

  for (const msg of payload) {
    const timer = randomTimer()
    console.log("Enviando mensagem em " + (timer / 1000) + " segundos...")
    const responseStatus = await whatsapp.checkNumberStatus(msg.number)
    console.log('responseStatus', responseStatus)
    try {
      if (!msg.image && fs.existsSync(msg.image)) {
        const response = await whatsapp.sendText(msg.number, msg.message)
        console.log('response sendText', response)
      } else {
        const response = await whatsapp.sendImage(
          msg.number,
          msg.image,
          "image",
          msg.message
        )
        console.log('response sendImage', response)
      }
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
    console.log("Mensagem enviada para o número: " + msg.number.replace('@c.us', ''))
  }
  return messagesSent
})

ipcMain.on('CLOSE_SESSION', async (event) => {
  try {
    await whatsapp.logout()
    await whatsapp.close()

    event.reply('SESSION_CLOSED')
  } catch (err) {
    event.reply('SESSION_CLOSE_ERROR', err)
  }
})

ipcMain.handle('showOpenDialog', async (_, options) => {
  return dialog.showOpenDialog(options)
})
