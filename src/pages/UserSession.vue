<template>
    <q-page class="flex flex-start column bg-green-3 text-center">
        <q-page-container class="flex flex-center column">
          <q-btn
            :ripple="false"
            flat
            round
            icon="logout"
            class="absolute-top-right"
            color="green"
            :disabled="isLoading"
            @click="showPrompt"
          />
            <h6>
              Nome da sessão: {{ sessionName }}
            </h6>
            <q-btn
              color="green"
              icon="download"
              label="Escolher Excel"
              :disabled="isLoading"
              @click="click"
            />
            <span class="q-pt-lg q-pb-sm">
                <b>
                    Arquivo selecionado:
                </b>
            </span>
            <span>
                {{ filePath }}
            </span>
            <q-footer
              v-if="!exiting"
              class="bg-green-3 q-py-sm"
            >
                <q-btn
                  color="green"
                  label="Enviar mensagens"
                  :loading="isLoading"
                  @click="readFile()"
                >
                </q-btn>
            </q-footer>
        </q-page-container>
      <q-inner-loading
        class="absolute-center window-width window-height z-inherit"
        :showing="exiting"
        label="Encerrando sessão"
        label-class="text-teal"
        label-style="font-size: 1.1em"
        color="green"
      />
    </q-page>
</template>

<script setup>
    import { useQuasar } from 'quasar'
    import { ref, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';

    const route = useRoute()
    const router = useRouter()
    const filePath = ref(null)
    const sessionName = ref("")
    const $q = useQuasar()
    const isLoading = ref(false)
    const exiting = ref(false)

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

    const showPrompt = () => {
      $q.dialog({
        dark: true,
        title: 'Sair',
        message: 'Você está encerrando essa sessão do whatsapp. Ao sair será necessário ler o QRCode novamente para continuar.',
        cancel: {
          label: 'Cancelar',
          push: true,
          color: 'negative',
        },
        ok: {
          label: 'Confirmar',
          push: true,
          color: 'green',
        },
        persistent: true
      }).onOk(() => {
        exiting.value = true
        window.whatsapp.send('CLOSE_SESSION')
      }).onCancel(() => {})
    }

window.xlsx.on('SEND_MESSAGES', async (payload) => {
  const responseSendMessage = await window.whatsapp.sendMessages(payload)
  console.log('responseSendMessage', responseSendMessage)
  const res = await window.xlsx.writeXlsx(responseSendMessage)
  isLoading.value = false
  if (res) {
    $q.notify({
      type: 'positive',
      message: 'Processo finalizado',
      position: 'top-right'
    })
  } else {
    $q.notify({
      type: 'negative',
      message: 'Erro ao gravar xlsx',
      position: 'top-right'
    })
  }
})

window.whatsapp.on('END_AUTOMATION', () => {

  })

  window.whatsapp.on('SESSION_CLOSED', () => {
    exiting.value = false
    router.push({name: 'index'})
  })

  window.whatsapp.on('SESSION_CLOSE_ERROR', (err) => {
    console.log({err})
    exiting.value = false
    $q.notify({
      type: 'negative',
      message: 'Ocorreu um erro ao finalizar a sessão',
      position: 'top-right'
    })
})
</script>
