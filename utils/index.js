import { inflate } from 'pako'

export * from './charts'

/**
 * @function utils_base64
 * @param base64String base64加密字符串
 * @return object
 * @description 解析接口返回的base64加密字符串
 * */
export const utils_base64 = base64String => {
    try {
        return JSON.parse(
            inflate(
                new Uint8Array(
                    atob(base64String)
                        .split('')
                        .map(e => e.charCodeAt(0))
                ),
                { to: 'string' }
            )
        )
    } catch (e) {
        console.error(e)
        return {}
    }
}

/**
 * @function utils_link
 * @param url 跳转地址 | HTMLHyperlinkElementUtils.href
 * @param target 跳转方式 | HTMLAnchorElement.target
 * @description 用 a 标签模拟跳转，避免兼容性问题
 * */
export const utils_link = (url, target = '_blank') => {
    const link = document.createElement('a')

    link.href = url
    link.target = target

    const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    })
    link.dispatchEvent(event)
}

/**
 * @function utils_amountFormatter
 * @param amount 金额
 * @return string
 * @description 将金额处理为带汉字的缩略
 * */
export const utils_amountFormatter = amount => {
    if (isNaN(amount)) return '--'

    if (amount < 1000) return amount.toString()

    if (amount < 10000) return (amount / 1000).toFixed(2) + ' 千'

    if (amount < 100000000) return (amount / 10000).toFixed(2) + ' 万'

    if (amount < 1000000000000) return (amount / 100000000).toFixed(2) + ' 亿'

    return (amount / 1000000000000).toFixed(2) + ' 千亿'
}