import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'

import { COMMON_FORM_CONFIG } from '../config'
import { api_fetch, API_PATH } from '../fetch'
import { utils_passwordEncode } from '../utils'
import { usePublicKeyStore } from '../store'
import { useSms } from './sms'

export const useAccountLogin = () => {
    const { publicKey } = storeToRefs(usePublicKeyStore())

    const formState = reactive({
        account: '',
        password: ''
    })

    const loading = ref(false)

    const onAccountLogin = async({ account, password }) => {
        if (!loading.value) {
            loading.value = true
            try {
                await api_fetch({
                    url: API_PATH.ACCOUNT_LOGIN,
                    params: {
                        username: account,
                        password: utils_passwordEncode(password, publicKey.value)
                    }
                })
            } finally {
                loading.value = false
            }
        }
    }

    return {
        formState,
        formConfig: [
            COMMON_FORM_CONFIG.account,
            COMMON_FORM_CONFIG.password
        ],
        loading,
        onAccountLogin
    }
}

export const useMobileLogin = ({ successTip, warnTip, errorTip }) => {
    const formState = reactive({
        account: '',
        password: ''
    })

    const loading = ref(false)

    const { smsBtn, onSendSms } = useSms('mobile-login', {
        successTip,
        warnTip,
        errorTip
    })

    const formConfig = [
        COMMON_FORM_CONFIG.mobile,
        COMMON_FORM_CONFIG.code
    ]

    const onMobileLogin = async({ mobile, code }) => {
        if (!loading.value) {
            loading.value = true
            try {
                await api_fetch({
                    url: API_PATH.MOBILE_LOGIN,
                    params: {
                        phone: mobile,
                        code
                    }
                })
            } finally {
                loading.value = false
            }
        }
    }

    return {
        formState,
        formConfig,
        loading,
        smsBtn,
        onSendSms,
        onMobileLogin
    }
}
