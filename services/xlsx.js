const xlsx = require("read-excel-file/node");
const sheetDir = "./sheets/automacao-whatsapp.xlsx";
const {
    dataSchema,
    configSchema
} = require("../schemas/xlsx")

async function readFile() {
    try {
        const data = await xlsx(sheetDir, {sheet: 1, schema: dataSchema})
        const config = await xlsx(sheetDir, {sheet: 2, schema: configSchema})

        return createMessagesArray({data, config})
    } catch (err) {
        console.log(process.env.READ_ERROR, err)
        process.exit(1)
    }
}

function createMessagesArray({data, config}) {
    return data.rows.map(row => {
        const cfg = config.rows.find(item => item.code === row.code)

        return {
            number: (row.phone).toString().concat("@c.us"),
            message: cfg.message,
            ...(cfg.image && {image: cfg.image})
        }
    })
}

module.exports = {
    readFile,
};
