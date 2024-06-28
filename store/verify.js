import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useVerifyStore = defineStore('verify', () => {
    visible = ref(false)

    const onClose = () => {
        visible.value = false
        alreadyRead.value = true
    }

    return {
        visible,
        onClose
    }
})
