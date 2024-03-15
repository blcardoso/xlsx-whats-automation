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
    } catch {
        finish(1)
    }
}

function finish(code) {
    console.log(!code ? process.env.SUCCESS_MSG : process.env.CREATION_ERROR)
    process.exit(code)
}

main()
