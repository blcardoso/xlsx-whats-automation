import readXlsxFile from 'read-excel-file/node';
import dataSchema from '../schemas/dataSchema';
import configSchema from '../schemas/configSchema';
import { ipcMain } from "electron";

const xlsx = require('exceljs');
var xlsxPath = ''
const wb = new xlsx.Workbook();

ipcMain.on('WRITE_XLSX', async (event, payload) => {
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

  await wb.xlsx.writeFile(xlsxPath)

  console.log('Processo encerrado')
  event.reply('END_AUTOMATION')
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
              ...(cfg.image && {image: cfg.image})
          }
      })

        event.reply('SEND_MESSAGES', messages)
    } catch (err) {
        console.log(err)
    }
})
