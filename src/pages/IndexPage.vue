<template>
  <q-page class="flex flex-center column bg-green-3 text-center">
   <q-inner-loading
     color="green"
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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const base64 = ref("")
const isVisible = ref(true)
const statusText = ref("")
const sessionText = ref("")
const router = useRouter()
const isConnected = ['isLogged', 'qrReadSuccess', 'chatsAvailable']

defineOptions({
  name: 'IndexPage'
});

onMounted(async () => {
  await window.whatsapp.createClient()

  window.whatsapp.on('QR_CODE', (qrCode) => {
    base64.value = qrCode
    isVisible.value = false
  })

  window.whatsapp.on('STATUS_SESSION', ({ session, statusSession }) => {
    statusText.value = statusSession
    sessionText.value = session

    if (isConnected.includes(statusSession)) {
      router.push({
        name: 'user-session',
        query: {
          user: sessionText.value
        }
      })
    }
  })
})

</script>
