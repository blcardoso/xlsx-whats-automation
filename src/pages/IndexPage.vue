<template>
  <q-page class="flex flex-center column bg-green-3 text-center">
    <h6>
      Escaneie o QR Code abaixo com o celular
    </h6>
    <q-btn color="primary" icon="check" label="Escolher Excel" @click="click" />
    {{ filePath }}
    <h3>Nome da sessão: {{ sessionText }}</h3>
    <h3>Status: {{ statusText }}</h3>
    <q-img style="max-width: 300px" loading="lazy" spinner-color="white" :src="base64"></q-img>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from "vue";
const base64 = ref("")
const statusText = ref("")
const sessionText = ref("")
const filePath = ref("")

defineOptions({
  name: 'IndexPage'
});

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

onMounted(async () => {
  window.whatsapp.send('CREATE_CLIENT')
  window.whatsapp.on('QR_CODE', (qrCode) => {
    base64.value = qrCode
  })
  window.whatsapp.on('STATUS_SESSION', ({ session, statusSession }) => {
    statusText.value = statusSession
    sessionText.value = session
  })
})
</script>
