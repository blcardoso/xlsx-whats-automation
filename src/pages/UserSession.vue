<template>
    <q-page class="flex flex-start column bg-green-3 text-center">
        <q-page-container class="flex flex-center column">
            <h6>Nome da sessão: {{ sessionName }}</h6>
            <q-btn color="green" icon="download" label="Escolher Excel" @click="click" />
            <span class="q-pt-lg q-pb-sm">
                <b>
                    Arquivo selecionado:
                </b>
            </span>
            <span>
                {{ filePath }}
            </span>

            <!-- <q-virtual-scroll :items="logs">
       </q-virtual-scroll> -->

            <q-footer class="bg-green-3 q-py-sm">
                <q-btn color="green" @click="readFile()" label="Enviar mensagens" :loading="isLoading">
                </q-btn>
            </q-footer>
        </q-page-container>
    </q-page>
</template>

<script setup>
    import { useQuasar } from 'quasar'
    import { ref, onMounted } from 'vue';
    import { useRoute } from 'vue-router';

    const route = useRoute()
    const filePath = ref(null)
    const sessionName = ref("")
    const $q = useQuasar()
    const logs = ref([])
    const isLoading = ref(false)

    defineOptions({
        name: 'UserSession'
    });

    onMounted(() => {
        sessionName.value = route.query.user
    })

    const click = async () => {
    const response = await window.whatsapp.showOpenDialog({
        title: "Escolha o arquivo excel",
        buttonLabel: "Abrir",
        // filters: FileFilter[];
        properties: ['openFile'],
        filters: [
        {
            name: 'xlsx, xls',
            extensions: ['xlsx', 'xls']
        }
        ],
        message: "Escolha o arquivo excel",
    })
  // exemplo da resposta
  // {canceled: false, filePaths: Array(1)}
    if (!response.canceled) {
        filePath.value = response.filePaths[0]
    }
    }

    const readFile = () => {
        if (!filePath.value) {
            $q.notify({
            type: 'negative',
            message: 'É preciso selecionar um caminho para leitura do arquivo',
            position: 'top-right'
            })
        } else {
            isLoading.value = true
            window.xlsx.send('READ_FILE', filePath.value)
        }
    }

window.xlsx.on('MESSAGES', payload => {
    window.whatsapp.send('SEND_MESSAGES', payload)
})

window.whatsapp.on('END_AUTOMATION', () => {
    isLoading.value = false
    $q.notify({
        type: 'positive',
        message: 'Processo finalizado',
        position: 'top-right'
    })
})

// window.whatsapp.on('CLIENT_NOT_INITIALIZED', () => {
//      $q.notify({
//         type: 'negative',
//         message: 'Whatsapp não disponível',
//         position: 'top-right'
//     })

//     isLoading.value = false
// })
</script>