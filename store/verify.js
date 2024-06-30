import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useVerifyStore = defineStore('verify', () => {
    const visible = ref(false)
    const config = null

    const onClose = () => {
        visible.value = false
    }

    const onShow = () => {
        visible.value = true
    }

    const setConfig = (newConfig) =>{
        config = newConfig
    }

    return {
        visible,
        config,
        onClose,
        onShow,
        setConfig
    }
})
