import readXlsxFile from 'read-excel-file/node';
import dataSchema from '../schemas/dataSchema';
import configSchema from '../schemas/configSchema';
import { ipcMain } from "electron";


ipcMain.on('READ_FILE', async (event, path) => {
    try {
        const data = await readXlsxFile(path, {sheet: 1, schema: dataSchema})
        const config = await readXlsxFile(path, {sheet: 2, schema: configSchema})
        const messages = data.rows.map(row => {
            const cfg = config.rows.find(item => item.code === row.code)
    
            return {
                number: (row.phone).toString().concat("@c.us"),
                message: cfg.message,
                ...(cfg.image && {image: cfg.image})
            }
        })

        event.reply('MESSAGES', messages)
    } catch (err) {
        console.log(err)
    }
})