import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useVerifyStore = defineStore('verify', () => {
    const visible = ref(false)

    const onClose = () => {
        visible.value = false
    }

    const onShow = () => {
        visible.value = true
    }

    return {
        visible,
        onClose,
        onShow
    }
})
