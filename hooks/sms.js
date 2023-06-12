import { computed, ref } from 'vue'

import { api_fetch, API_PATH, FETCH_METHOD } from '../fetch'
import { useCountdown } from './countdown'

export const useSms = (name, { successTip, warnTip, errorTip }) => {
    const { countdown, onCountdown } = useCountdown(name)

    const loading = ref(false)

    const smsBtn = computed(() => {
        const counting = countdown.value > 0

        return {
            text: counting ? `${countdown.value}s` : '发送验证码',
            disabled: counting,
            loading: loading.value
        }
    })


    // 发送短信验证码
    const onSendSms = async (phone) => {
        if (!loading.value) {
            loading.value = true
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
                loading.value = false
            }
        }
    }

    return {
        smsBtn,
        onSendSms
    }
}