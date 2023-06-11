import { reactive, ref, computed, onMounted } from 'vue'
import _ from 'lodash'

import { api_fetch, API_PATH, FETCH_METHOD } from '../fetch'
import { COMMON_FORM_CONFIG } from '../config'
import { useCountdown } from './countdown'
import { usePublicKeyStore } from '../store'
import { utils_passwordEncode } from '../utils'

export const useRegister = ({
    successTip,
    warnTip,
    errorTip,
    submitCallback
}) => {
    const { publicKey } = usePublicKeyStore()

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
            referrer: ''
        }),
        checkLoading = ref(false),
        smsLoading = ref(false),
        submitLoading = ref(false)

    const { resume, countdown, onCountdown } = useCountdown('register-sms'),
        smsBtn = computed(() => {
            if (countdown.value) {
                return {
                    text: `${countdown.value}s`,
                    disabled: true
                }
            } else {
                return {
                    text: '发送验证码',
                    disabled: false
                }
            }
        })

    // 页面加载时有未完成倒计时，继续倒计时
    onMounted(() => {
        if (countdown.value > 0) resume()
    })

    // 页面加载时有未完成倒计时，继续倒计时
    onMounted(() => {
        if (countdown.value > 0) resume()
    })

    // 检查账号是否重复
    const onCheckAccount = async (username) => {
        if (!checkLoading.value) {
            checkLoading.value = true
            try {
                const isRepeat = await api_fetch({
                    url: API_PATH.CHECK_ACCOUNT_REGISTER,
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

    // 发送短信验证码
    const onSendSms = async (phone) => {
        if (!smsLoading.value) {
            smsLoading.value = true
            try {
                const isRepeat = await api_fetch({
                    url: API_PATH.CHECK_MOBILE_REGISTER,
                    method: FETCH_METHOD.GET,
                    params: {
                        phone
                    }
                })

                if (isRepeat) {
                    warnTip?.('当前手机号已注册')
                } else {
                    await api_fetch({
                        url: API_PATH.SEND_SMS + phone
                    })
                    successTip?.('短信验证码已发送，请注意查收')

                    onCountdown()
                }
            } catch (err) {
                errorTip?.(err.message)
            } finally {
                smsLoading.value = false
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
                    url: API_PATH.CHECK_SMS,
                    params: {
                        phone: mobile,
                        code
                    }
                })

                await api_fetch({
                    url: API_PATH.REGISTER,
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