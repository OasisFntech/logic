import { onBeforeUnmount } from 'vue'
import { useIntervalFn, useLocalStorage } from '@vueuse/core'

export const useCountdown = (name) => {
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

    onBeforeUnmount(() => {
        pause()
    })

    return {
        pause,
        resume,
        countdown,
        onCountdown
    }
}