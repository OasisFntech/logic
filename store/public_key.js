import { defineStore } from 'pinia'

import { useRequest, API_PATH } from '../fetch'

export const usePublicKeyStore = defineStore('publicKey', () => {
    const { response } = useRequest({
        url: API_PATH.PUBLIC_KEY
    })

    return {
        publicKey: response.value
    }
})