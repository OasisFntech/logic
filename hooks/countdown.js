import { onMounted } from 'vue'
import { useIntervalFn, useLocalStorage } from '@vueuse/core'

export const useCountdown = (name = 'noname') => {
    const key = `${name}-countdown`,
        countdown = useLocalStorage(key, 0)

    // 倒计时函数
    const { pause, resume } = useIntervalFn(() => {
        if (countdown.value > 0) {
            countdown.value --
        } else {
            localStorage.removeItem(key)
            pause()
        }
    }, 1000)

    // 开始倒计时
    const onCountdown = (time = 60) => {
        countdown.value = time
        resume()
    }

    // 页面加载时有未完成倒计时，继续倒计时
    onMounted(() => {
        if (countdown.value > 0) resume()
    })

    return {
        pause,
        resume,
        countdown,
        onCountdown
    }
}
