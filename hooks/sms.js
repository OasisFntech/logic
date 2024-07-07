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
                const res = await api_fetch({
                    url: COMMON_API_PATH.SMS_SEND + phone,
                    method:'put'
                })
                successTip?.('短信验证码已发送，请注意查收')
                onCountdown()
                console.log(res)
                console.log('1111',res)
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
