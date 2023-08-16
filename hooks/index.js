import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTitle } from '@vueuse/core'
import _ from 'lodash'

import { api_fetch, COMMON_API_PATH } from '../fetch'
import { useSiteConfigStore } from '../store'
import { utils_assign_object, utils_favicon } from '../utils'

export * from './market'
export * from './register'
export * from './countdown'
export * from './sms'
export * from './login'
export * from './news'

export const useFormDisabled = formState => computed(() => !_.every(formState, Boolean))

export const useSiteConfig = async(callback) => {
    const res = await api_fetch({
        url: COMMON_API_PATH.SITE_CONFIG
    })

    try {
        await callback(res.siteSwitch)

        const { siteConfig } = storeToRefs(useSiteConfigStore())

        siteConfig.value = utils_assign_object(siteConfig.value, res)
    } finally {
        useTitle(res.siteName)
        utils_favicon(res.titleAddress)
    }
}
