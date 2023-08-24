import JSEncrypt from 'jsencrypt'
import { inflate } from 'pako'
import { useClipboard, usePermission } from '@vueuse/core'
import _ from 'lodash'

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
        return base64String
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
 * @function utils_amount_chinesization
 * @param amount 金额
 * @param options
 * @params showThousand 是否展示 千 位
 * @params fixed 保留小数位数
 * @return string
 * @description 将金额处理为带汉字的缩略
 * */
export const utils_amount_chinesization = (amount, options) => {
    const { showThousand, fixed } = {
        showThousand: true,
        fixed: 2,
        ...options
    }

    if (isNaN(amount)) return '--'

    if (amount < 1000) return amount.toFixed(fixed)

    if (amount < 10000) return (amount / 1000).toFixed(fixed) + (showThousand ? '千' : '')

    if (amount < 100000000) return (amount / 10000).toFixed(fixed) + '万'

    if (amount < 1000000000000) return (amount / 100000000).toFixed(fixed) + '亿'

    return (amount / 1000000000000).toFixed(fixed) + '千亿'
}

export const utils_number_format = (number, options) => {
    if (isNaN(number)) {
        return number
    } else {
        const { prefix, fixed, suffix } = {
            fixed: 2,
            prefix: '',
            suffix: '',
            ...options,
        }

        return `${prefix}${Number(number).toFixed(fixed)}${suffix}`
    }
}

// 密码加密
export const utils_passwordEncode = (password, publicKey) => {
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(publicKey)
    return encrypt.encrypt(password)
}

export const utils_inviteCode = () => {
    const { href } = window.location,
        params = new URLSearchParams(href.split('?')[1])

    return params.get('inviteCode')
}

export const utils_guideRedirect = (url, target) => {
    const params = new URLSearchParams(),
        inviteCode = utils_inviteCode()

    if (inviteCode) {
        params.set('inviteCode', inviteCode)
        url += `?${params.toString()}`
    }

    utils_link(url, target)
}

export const utils_decisionDevice = () => {
    const isPhone = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i),
        pathname = window.location.pathname

    if (isPhone) {
        if (!pathname.includes('/m/')) {
            utils_guideRedirect('/m/', '_self')
        }
    } else {
        if (!pathname.includes('/pc/')) {
            utils_guideRedirect('/pc/', '_self')
        }
    }
}

export const utils_favicon = (href) => {
    const faviconLink = document.createElement('link')
    faviconLink.rel = 'icon'
    faviconLink.href = href
    faviconLink.type = 'image/x-icon'

    document.head.appendChild(faviconLink)
}

export const utils_assign_object = (oldObj, newObj, force) => {
    if (force) {
        return {
            ...oldObj,
            ...newObj
        }
    } else {
        const obj = {
            ...oldObj
        }

        _.entries(newObj).forEach(e => {
            const [ key, val ] = e

            if (val !== undefined) {
                obj[key] = val
            }
        })

        return obj
    }
}

// 复制函数
export const utils_copy = async ({ content, onSuccess, onFail }) => {
    // 用户浏览器授权
    const { copy } = useClipboard()

    try {
        await copy(content)
        onSuccess()
    } catch (e) {
        console.error(e)
        onFail()
    }
}

// 清楚所有缓存
export const utils_storage_clear = () => {
    sessionStorage.clear()
    localStorage.clear()
}

export const utils_hide_info = (content, type) => {
    switch (type) {
        case 'mobile':
            return `${content.slice(0, 3)}****${content.slice(-4)}`
    }
}
