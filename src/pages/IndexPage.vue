<template>
  <q-page class="flex flex-center column bg-green-3 text-center">
    <h6>
      Escaneie o QR Code abaixo com o celular
    </h6>
    <q-img
      style="max-width: 300px"
      loading="lazy"
      spinner-color="white"
      :src="base64"
    ></q-img>
  </q-page>
</template>

<script setup>
import {onMounted, ref} from "vue";
const base64 = ref("")

defineOptions({
  name: 'IndexPage'
});

onMounted(async () => {
  console.log('window.whatsapp', window.whatsapp)
  window.whatsapp.send('CREATE_CLIENT', 'teste')
  window.whatsapp.on('QR_CODE', (qrCode) => {
    console.log({qrCode})
      base64.value = qrCode
  })
})
</script>
