import { computed, ref } from 'vue'

import { api_fetch, COMMON_API_PATH } from '../fetch'
import { useCountdown } from './countdown'
import { useMobileLogin } from './login'

export const useSms = (name, { successTip, errorTip }) => {
    const { countdown, onCountdown } = useCountdown(name)
    const { updateCode, formState } = useMobileLogin()

    const loading = ref(false)
    const smsCode = ref(null)

    const smsBtn = computed(() => {
        const isCounting = countdown.value === 0

        return {
            text: isCounting ? '发送验证码' : `${countdown.value}s`,
            disabled: !isCounting,
            loading: loading.value,
            smsCode: smsCode.value
        }
    })


    // 发送短信验证码
    const onSendSms = async (phone, bizType, imgCode) => {
        let logString = `[${new Date().toISOString()}] 请求发送验证码接口:`
        if (!loading.value) {
            loading.value = true
            try {
                const { code, message } = await api_fetch({
                    url: `${COMMON_API_PATH.SMS_SEND}${phone}/${bizType}`,
                    params: {
                        imgCode
                    },
                    options: {
                        returnAll: true,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                })
                logString += ` 接口调用成功 code=${code}, message=${message}`
                if (code === 1 && message) {
                    logString += ` 验证码已更新`
                    updateCode(message)
                    smsCode.value = message
                }
                successTip?.('短信验证码已发送，请注意查收')
                onCountdown()
            } catch (err) {
                logString += ` 接口调用失败 error=${err.message}`
                errorTip?.(err.message)
            } finally {
                loading.value = false
                const existingLog = localStorage.getItem('testLog') || ''
                localStorage.setItem('testLog', existingLog + '\n' + logString)
            }
        }
    }

    return {
        smsBtn,
        onSendSms,
    }
}
