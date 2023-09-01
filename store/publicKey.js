import { ref } from 'vue'
import { defineStore } from 'pinia'
import JSEncrypt from 'jsencrypt'

import { useRequest, COMMON_API_PATH } from '../fetch'

export const usePublicKeyStore = defineStore('publicKey', () => {
    const publicKey = ref('')

    const { response, onRefresh } = useRequest({
        url: COMMON_API_PATH.PUBLIC_KEY,
        initialValues: ''
    })

    const onEncode = async(content) => {
        if (!publicKey.value) {
            await onRefresh()
        }

        const encrypt = new JSEncrypt()
        encrypt.setPublicKey(publicKey.value)

        return encrypt.encrypt(content)
    }

    return {
        publicKey: response,
        onEncode,
        onUpdatePublicKey: onRefresh
    }
}, {
    persist: {
        storage: sessionStorage,
    },
})
