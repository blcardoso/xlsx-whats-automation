const {create} = require("venom-bot")
const {randomTimer} = require("./utils");

async function createWhatsAppClient() {
    return await create({
        session: process.env.USERNAME,
        folderNameToken: "tokens",
        mkdirFolderToken: "./whatsapp-config"
    })
}

async function sendMessages(client, messages) {
    for (const msg of messages) {
        try {
            const timer = randomTimer()
            console.log("Sending next message in " + (timer / 1000) + " seconds...")

            await new Promise((resolve, reject) => {
                setTimeout((_) => {
                    if (!msg.image) {
                        client.sendText(msg.number, msg.message)
                            .then(resolve)
                            .catch(reject)
                    } else {
                        client.sendImage(
                            msg.number,
                            msg.image,
                            "image",
                            msg.message
                        )
                            .then(resolve)
                            .catch(reject)
                    }
                }, timer)
            })

            console.log("Message to " + msg.number + " sent!")
        } catch (e) {
            console.log("Error sending message to " + msg.number)
        }
    }
}

module.exports = {
    createWhatsAppClient,
    sendMessages
}