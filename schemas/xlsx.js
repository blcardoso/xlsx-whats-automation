const dataSchema = {
    Telefone: {
        prop: 'phone',
        type: String,
    },
    Codigo: {
        prop: 'code',
        type: String,
    },
};
const configSchema = {
    Codigo: {
        prop: 'code',
        type: String,
    },
    Mensagem: {
        prop: 'message',
        type: String,
    },
    Imagem: {
        prop: 'image',
        type: String,
    },
};

module.exports = {
    dataSchema,
    configSchema
}