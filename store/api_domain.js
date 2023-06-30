import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import _ from 'lodash'

import { api_fetch } from '../fetch'
import { utils_guideRedirect } from '../utils'

//  检查域名地址，会额外返回delay延迟时间
const onCheckDomain = async ({ url, params, fetchTime, config }) => {
    let delay = 0
    await api_fetch({
        url,
        params,
        options: {
            ...config,
            onDownloadProgress: () => {
                delay = +new Date() - fetchTime
            }
        }
    })

    return {
        delay,
        ...params
    }
}

export const useApiDomainStore = defineStore('api_domain', () => {
    /**
     * @const api_domain  api请求地址
     * @const web_domain  域名线路地址列表
     * @const loading  加载状态
     * @const service  客服配置信息
     * */
    const api_domain = ref([]),
        web_domain = ref([]),
        loading = ref(false)

    const onInit = async () => {
        loading.value = true
        try {
            //  获取可用的api地址
            const all_apis = await api_fetch({
                url: '/api/check/domains/getApiDmian',
                method: 'get'
            })

            if (all_apis.length) {
                // 校验api地址
                all_apis.forEach(e => {
                    const fetchTime = +new Date()
                    onCheckDomain({
                        url: '/api/check/systemConfigCheck/getCheck',
                        params: { domainName: e.domain, time: fetchTime },
                        fetchTime
                    }).then(res => {
                        api_domain.value.push(res)
                    })
                })
            }

            // 获取所有域名线路
            const all_webs = await api_fetch({
                url: '/api/check/domains/getWebDmian',
                method: 'get'
            })

            if (all_webs.length) {
                // 检查可用域名
                all_webs.map(e => {
                    const fetchTime = +new Date()
                    onCheckDomain({
                        url: `/web/check/${fetchTime}`,
                        params: { domainName: e.domain },
                        fetchTime,
                        config: {
                            baseURL: e.domain
                        }
                    }).then(res => {
                        web_domain.value.push(res)
                    })
                })
            }
        } finally {
            loading.value = false
        }
    }

    onInit()

    // 只展示延迟最小的前五条线路
    const showSites = computed(() => {
        const delaySort = _.sortBy(web_domain.value, 'delay')
        return _.take(delaySort, 5)
    })

    const onChooseBest = () => {
        // 获取域名列表中延迟最小的
        const bestDomain = _.minBy(showSites.value, 'delay')
        if (bestDomain) utils_guideRedirect(bestDomain.domainName)
    }

    return {
        api_domain,
        showSites,
        loading,
        onChooseBest
    }
})