import { onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'

let countdown_interval = null

export const useCountdown = (name = 'noname') => {
    const key = `${name}-countdown`,
        countdown = useLocalStorage(key, 0)

    // 倒计时函数
    const onStart = () => {
        countdown_interval = setInterval(() => {
            if (countdown.value > 0) {
                countdown.value --
            } else {
                localStorage.removeItem(key)
                clearInterval(countdown_interval)
                countdown_interval = null
            }
        }, 1000)
    }

    // 开始倒计时
    const onCountdown = (time = 60) => {
        countdown.value = time
        onStart()
    }

    // 页面加载时有未完成倒计时，继续倒计时
    onMounted(() => {
        if (countdown.value > 0) onStart()
    })

    return {
        countdown,
        onCountdown
    }
}
