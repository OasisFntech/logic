import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useTitle } from '@vueuse/core'

import { useRequest, API_PATH } from '../fetch'
import { utils_favicon } from '../utils'

export const useSiteConfigStore = defineStore('siteConfig', () => {
    // 站点配置
    const config = ref({
        keyword: null,
        siteLogo: null,
        siteLogo2: null,
        // 站点名
        siteName: '',
        // 页面 ico 图标
        titleAddress: '',
        // 备案号 - Copyright展示
        recordNumber: '',
        siteSwitch: false,
        registerSwitch: false,
        type: '',
        benchmarkPeople: 0,
        benchmarkAmount: 0,
        applyContractSwitch: false,
        // 商标地址 - Copyright展示
        copyrightInformation: '',
        imgCodeSwitch: false,
        // 客服链接 - Footer展示
        customerServiceLink: '',
        // 客服联系方式 - Footer展示
        customerServicePhone: '',
        customerServiceUrl: '',
        longConnectionSwitch: '',
        // 办公地址 - Footer展示
        officeLocation: '',
        // 办公时间 - Footer展示
        onlineTime: '',
        siteStat: '',
        webSiteStat: '',
        rebateSwitch: false,
        autoAgent: false,
        // 底部二维码地址 - Footer展示
        qrCodeAddress: ''
    })

    // 请求基础配置
    useRequest({
        url: API_PATH.SITE_CONFIG,
        onSuccess: res => {
            useTitle(res.siteName)
            utils_favicon(res.titleAddress)

            config.value = {
                ...config.value,
                ...res
            }
        }
    })

    // 请求客服配置 ps:后端可优化的接口
    useRequest({
        url: API_PATH.BASE_INFO,
        params: {
            configKey: 'customerServiceManagement'
        },
        onSuccess: res => {
            config.value = {
                ...config.value,
                ...res
            }
        }
    })

    // 获取logo
    const { response: logoRes } = useRequest({
        url: API_PATH.PC_CONFIG
    })

    return {
        logoRes,
        config
    }
})