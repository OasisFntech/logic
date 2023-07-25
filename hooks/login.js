import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'

import { COMMON_FORM_CONFIG } from '../config'
import { api_fetch, API_PATH, FETCH_METHOD } from '../fetch'
import { utils_passwordEncode } from '../utils'
import { usePublicKeyStore, useUserInfoStore } from '../store'
import { useFormDisabled } from './index'

export const useAccountLogin = () => {
    const { publicKey } = storeToRefs(usePublicKeyStore()),
        { onSetUserInfo, onRefreshUserInfo } = useUserInfoStore()

    const formState = reactive({
            account: '',
            password: ''
        }),
        disabled = useFormDisabled(formState),
        loading = ref(false)

    const onAccountLogin = async() => {
        if (!loading.value) {
            loading.value = true
            try {
                const res = await api_fetch({
                    url: API_PATH.ACCOUNT_LOGIN,
                    params: {
                        username: formState.account,
                        password: utils_passwordEncode(formState.password, publicKey.value)
                    }
                })

                onSetUserInfo(res)
                onRefreshUserInfo()
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
        disabled,
        loading,
        onAccountLogin
    }
}

export const useMobileLogin = ({ unRegisterCallback }) => {
    const { onSetUserInfo, onRefreshUserInfo } = useUserInfoStore()

    const formState = reactive({
            mobile: '',
            code: ''
        }),
        disabled = useFormDisabled(formState),
        loading = ref(false)

    const formConfig = [
        COMMON_FORM_CONFIG.mobile,
        COMMON_FORM_CONFIG.code
    ]

    const onMobileLogin = async() => {
        if (!loading.value) {
            loading.value = true
            try {
                const isRegister = await api_fetch({
                    url: API_PATH.CHECK_MOBILE_REGISTER,
                    method: FETCH_METHOD.GET,
                    params: {
                        phone: formState.mobile
                    }
                })

                if (isRegister) {
                    const res = await api_fetch({
                        url: API_PATH.MOBILE_LOGIN,
                        params: {
                            phone: formState.mobile,
                            code: formState.code
                        }
                    })

                    onSetUserInfo(res)
                    onRefreshUserInfo()
                } else {
                    unRegisterCallback?.()
                }
            } finally {
                loading.value = false
            }
        }
    }

    return {
        formState,
        formConfig,
        disabled,
        loading,
        onMobileLogin
    }
}
