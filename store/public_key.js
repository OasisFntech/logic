import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useRequest, API_PATH } from '../fetch'

export const usePublicKeyStore = defineStore('publicKey', () => {
    const publicKey = ref('')

    console.log('publicKeyStore')
    useRequest({
        url: API_PATH.PUBLIC_KEY,
        manual: !publicKey.value,
        onSuccess: res => {
            console.log(res)
            publicKey.value = res
            console.log(publicKey.value, '1')
        }
    })

    return {
        publicKey
    }
})