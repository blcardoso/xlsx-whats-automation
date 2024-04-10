const { ipcMain, dialog, app } = require("electron");
const { create } = require('venom-bot')
const moment = require('moment-timezone')
const xlsx = require('exceljs');
var xlsxPath = ''
const wb = new xlsx.Workbook();
import fs from 'fs'
import log from '../logger/logger'
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
    log.error("ERRO", error)
    app.relaunch()
    app.exit()
  }
})
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

ipcMain.handle('SEND_MESSAGES', async (event, payload) => {
  const messagesSent = []

  for (const msg of payload) {
    try {
      log.info(`msg.message ${msg.message}`)
      log.info(`msg.number ${msg.number}`)
      log.info(`msg.image ${msg.image}`)
      if (!fs.existsSync(msg.image)) {
        const response = await whatsapp.sendText(msg.number, msg.message)
        log.info(`response sendText ${JSON.stringify(response)}`)
      } else {
        const success = await whatsapp.sendVideo(msg.number, msg.image, msg.message);
        log.info(`response sendImage ${JSON.stringify(success)}`)
      }
      messagesSent.push({
        phone: msg.number.replace('@c.us', ''),
        status: 'Sucesso',
        last_sent: moment().tz("America/Sao_Paulo").format('DD/MM/YYYY HH:mm:ss')
      })
    } catch (err) {
      log.error(`Erro ao enviar mensagem para o numero: ${msg.number.replace('@c.us', '')}, erro: ${JSON.stringify(err)}`)

      messagesSent.push({
        phone: msg.number.replace('@c.us', ''),
        status: err,
        last_sent: moment().tz("America/Sao_Paulo").format('DD/MM/YYYY HH:mm:ss')
      })
    }
    log.info("Mensagem enviada para o numero: " + msg.number.replace('@c.us', ''))
    sleep(2000)
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
    log.error(err)
  }
})
