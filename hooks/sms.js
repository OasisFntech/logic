import { computed, ref } from 'vue'

import { api_fetch, COMMON_API_PATH } from '../fetch'
import { useCountdown } from './countdown'

export const useSms = (name, { successTip, errorTip }) => {
    const { countdown, onCountdown } = useCountdown(name)

    const loading = ref(false)

    const smsBtn = computed(() => {
        const isCounting = countdown.value === 0

        return {
            text: isCounting ? '发送验证码' : `${countdown.value}s`,
            disabled: !isCounting,
            loading: loading.value
        }
    })


    // 发送短信验证码
    const onSendSms = async (phone) => {
        if (!loading.value) {
            loading.value = true
            try {
                const { code, message } = await api_fetch({
                    url: COMMON_API_PATH.SMS_SEND + phone,
                    options: {
                        returnAll: true,
                    }
                })
                successTip?.('短信验证码已发送，请注意查收')
                onCountdown()
                let codeValue = ''
                if(code===1 && message){
                    codeValue = message
                }
                return {
                    code:codeValue
                }
            } catch (err) {
                errorTip?.(err.message)
            } finally {
                loading.value = false
            }
        }
    }

    return {
        smsBtn,
        onSendSms
    }
}
