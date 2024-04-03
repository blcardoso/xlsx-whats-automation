const { randomTimer } = require('../utils')
const { ipcMain, dialog } = require("electron");
const { create } = require('venom-bot')
const moment = require('moment-timezone')
const xlsx = require('exceljs');
var xlsxPath = ''
const wb = new xlsx.Workbook();
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
  } catch (error) {
    console.log("ERRO", error)
  }
})

ipcMain.handle('SEND_MESSAGES', async (event, payload) => {
  const messagesSent = []

  for (const msg of payload) {
    try {
      const timer = randomTimer()
      console.log("Enviando mensagem em " + (timer / 1000) + " segundos...")
      const responseStatus = await whatsapp.checkNumberStatus(msg.number)
      console.log('responseStatus', responseStatus)
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


ipcMain.handle('WRITE_XLSX', async (event, payload) => {
  const sheet = wb.getWorksheet(1)
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const phone = row.getCell('B').value
      const itemSent = payload.find(item => item.phone == phone)

      const lastSentCell = row.getCell('D')
      const statusCell = row.getCell('E')

      lastSentCell.value = itemSent.last_sent
      statusCell.value = itemSent.status

      row.commit()
    }
  })
  try {
    await wb.xlsx.writeFile(xlsxPath)
    return true
  } catch (error) {
    return false
  }
})
ipcMain.on('READ_FILE', async (event, path) => {
  xlsxPath = path
  try {
    const workbook = await wb.xlsx.readFile(path)
    const messagesSheet = workbook.getWorksheet(1)
    const configSheet = workbook.getWorksheet(2)
    const configs = []
    const numbersToSend = []

    configSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        configs.push({
          code: row.getCell('A').value,
          message: row.getCell('B').value,
          image: row.getCell('C').value
        })
      }
    })
    messagesSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        numbersToSend.push({
          name: row.getCell('A').value,
          phone: row.getCell('B').value,
          code: row.getCell('C').value
        })
      }
    })

    const messages = numbersToSend.map(item => {
      const cfg = configs.find(config => config.code == item.code)

      return {
        number: (item.phone).toString().concat("@c.us"),
        message: cfg.message,
        ...(cfg.image && { image: cfg.image })
      }
    })

    event.reply('SEND_MESSAGES', messages)
  } catch (err) {
    console.log(err)
  }
})
