<template>
  <q-page class="flex flex-center column bg-green-3 text-center">
   <q-inner-loading
     :showing="isVisible"
     label="Inicializando whatsapp"
     label-class="text-teal"
     label-style="font-size: 1.1em"
   />

    <div v-if="!isVisible" class="flex flex-center column">
      <h6>
        Escaneie o QR Code abaixo com o celular
      </h6>
      <q-img
        style="max-width: 300px"
        loading="lazy"
        spinner-color="white"
        :src="base64"
      ></q-img>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from "vue";
const base64 = ref("")
const isVisible = ref(true)

defineOptions({
  name: 'IndexPage'
});

onMounted(async () => {
  await window.whatsapp.send('CREATE_CLIENT')
  await window.whatsapp.on('QR_CODE', (qrCode) => {
    base64.value = qrCode
    isVisible.value = false
  })
})
</script>
