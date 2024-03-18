const {readFile} = require("./services/xlsx");
const {
    createWhatsAppClient,
    sendMessages
} = require("./services/whatsapp")
const {app, BrowserWindow} = require("electron")

function main() {
    try {
        app.whenReady().then(async () => {
            await createAppWindow()
        })


        // readFile()
        //     .then(async (messages) => {
        //         const client = await createWhatsAppClient()
        //         await sendMessages(client, messages)
        //     })

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') app.quit()
        })
    } catch {
        process.exit(1)
    }
}

function createAppWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 300,
        autoHideMenuBar: true
    })

    return win.loadFile('./pages/index.html')
}

main()
