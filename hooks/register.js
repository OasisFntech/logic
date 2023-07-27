import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import _ from 'lodash'

import { api_fetch, COMMON_API_PATH } from '../fetch'
import { COMMON_FORM_CONFIG } from '../config'
import { useSms } from './sms'
import { usePublicKeyStore } from '../store'
import { utils_passwordEncode } from '../utils'

export const useRegister = ({
    successTip,
    warnTip,
    errorTip,
    submitCallback,
    initialValues
}) => {
    const { publicKey } = storeToRefs(usePublicKeyStore())

    /**
     * @const formState form表单数据
     * @const checkLoading 检查账号 loading
     * @const smsLoading 发送验证码 loading
     * @const submitLoading 提交 loading
     * */
    const formState = reactive({
            account: '',
            password: '',
            repeat: '',
            mobile: '',
            code: '',
            referrer: '',
            ...initialValues
        }),
        checkLoading = ref(false),
        smsLoading = ref(false),
        submitLoading = ref(false)

    const { smsBtn, onSendSms } = useSms(
        'register-sms',
        {
            successTip,
            warnTip,
            errorTip
        })


    // 检查账号是否重复
    const onCheckAccount = async (username) => {
        if (!checkLoading.value) {
            checkLoading.value = true
            try {
                const isRepeat = await api_fetch({
                    url: COMMON_API_PATH.CHECK_ACCOUNT_REGISTER,
                    params: {
                        username
                    }
                })

                if (isRepeat) {
                    warnTip?.('用户名已注册')
                } else {
                    successTip?.('用户名可用')
                }
            } catch (err) {
                errorTip?.(err.message)
            } finally {
                checkLoading.value = false
            }
        }
    }

    // 注册提交
    const onSubmit = async (values) => {
        if (!submitLoading.value) {
            submitLoading.value = true

            try {
                const { account, password, mobile, code, referrer } = values

                // 校验短信验证码
                await api_fetch({
                    url: COMMON_API_PATH.CHECK_SMS,
                    params: {
                        phone: mobile,
                        code
                    }
                })

                await api_fetch({
                    url: COMMON_API_PATH.REGISTER,
                    params: {
                        username: account,
                        nickName: mobile,
                        phone: mobile,
                        code,
                        inviterPhone: referrer,
                        userType: 1,
                        transactionPassword: '',
                        loginPassword: utils_passwordEncode(password, publicKey.value),
                        exclusiveDomain: window.location.origin
                    }
                })

                successTip?.('注册成功')
                submitCallback?.()
            } catch (err) {
                if (err?.message) errorTip?.(err.message)
            } finally {
                submitLoading.value = false
            }
        }
    }

    return {
        formState,
        REGISTER_FORM_CONFIG: _.values(COMMON_FORM_CONFIG),
        checkLoading,
        onCheckAccount,
        smsLoading,
        smsBtn,
        onSendSms,
        submitLoading,
        onSubmit
    }
}
