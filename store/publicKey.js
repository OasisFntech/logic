import { defineStore } from 'pinia'
import JSEncrypt from 'jsencrypt'

import { useRequest, COMMON_API_PATH } from '../fetch'

export const usePublicKeyStore = defineStore('publicKey', () => {
    const { response: publicKey, onRefresh: onUpdatePublicKey } = useRequest({
        url: COMMON_API_PATH.PUBLIC_KEY,
        initialValues: ''
    })

    const onEncode = async(content) => {
        console.log(publicKey.value)
        if (!publicKey.value) await onUpdatePublicKey()

        const encrypt = new JSEncrypt()
        encrypt.setPublicKey(publicKey.value)

        const encode = encrypt.encrypt(content)
        console.log(encode)

        return encode
    }

    return {
        publicKey,
        onEncode,
        onUpdatePublicKey
    }
}, {
    persist: {
        storage: sessionStorage,
    },
})
