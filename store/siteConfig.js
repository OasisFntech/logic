import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useTitle } from '@vueuse/core'

import { useRequest, COMMON_API_PATH } from '../fetch'
import { utils_assign_object, utils_favicon } from '../utils'

export const useSiteConfigStore = defineStore('siteConfig', () => {
    // 站点配置
    const siteConfig = ref({
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
        url: COMMON_API_PATH.SITE_CONFIG,
        onSuccess: res => {
            useTitle(res.siteName)
            utils_favicon(res.titleAddress)

            siteConfig.value = utils_assign_object(siteConfig.value, res)
        }
    })

    // 请求客服配置 ps:后端可优化的接口
    useRequest({
        url: COMMON_API_PATH.BASE_INFO,
        params: {
            configKey: 'customerServiceManagement'
        },
        onSuccess: res => {
            siteConfig.value = {
                ...siteConfig.value,
                ...res
            }
        }
    })

    // 获取logo
    const { response: logoRes } = useRequest({
        url: COMMON_API_PATH.PC_CONFIG,
        initialValues: {
            logoAddress: ''
        }
    })

    return {
        siteConfig,
        logoRes
    }
})
