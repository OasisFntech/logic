import { defineStore } from 'pinia'

import { useRequest, COMMON_API_PATH } from '../fetch'

export const usePublicKeyStore = defineStore('publicKey', () => {
    const { response } = useRequest({
        url: COMMON_API_PATH.PUBLIC_KEY,
        initialValues: ''
    })

    return {
        publicKey: response
    }
})
