import { ipcMain } from "electron";
import { create, Whatsapp } from "venom-bot"

ipcMain.handle("whatsapp:create-client", async (_) => {
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
  console.log("teste", payload  )
  const client = await create({
    session: process.env.USERNAME,
    catchQR: (qrCode, asciiQR) => {
      event.reply('QR_CODE', qrCode)
    },
    logQR: false,
    folderNameToken: "tokens",
    mkdirFolderToken: "./whatsapp-config"
  })

  console.log(client)

})
