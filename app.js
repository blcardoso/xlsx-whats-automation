const {readFile} = require("./services/xlsx");
const {
    createWhatsAppClient,
    sendMessages
} = require("./services/whatsapp")

function main() {
    try {
        readFile()
            .then(async (messages) => {
                const client = await createWhatsAppClient()
                await sendMessages(client, messages)

                finish(0)
            })
    } catch (err) {
        console.log(process.env.CREATION_ERROR, err)
        finish(1)
    }
}

function finish(code) {
    process.exit(code)
}

main()
