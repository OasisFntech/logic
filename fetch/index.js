import { computed, isRef, ref } from 'vue'

export * from './apis'
export * from './axios'
export * from './stocket'

import axios from './axios'

export const FETCH_METHOD = {
    POST: 'post',
    GET: 'get',
    DELETE: 'delete'
}

export function api_fetch({ url, params, method = 'post', options }) {
    try {
        switch (method) {
            case FETCH_METHOD.GET:
                return axios.get(
                    url,
                    {
                        params,
                        ...options
                    }
                )
            case FETCH_METHOD.POST:
                return axios.post(
                    url,
                    params,
                    options
                )
            case FETCH_METHOD.DELETE:
                return axios.delete(
                    url
                )
        }
    } catch (e) {
        return Promise.reject(e)
    }
}

export function useRequest({
    url,
    params,
    method,
    initialValues,
    manual,
    formatResult,
    onSuccess,
    onErr,
}) {
    const response = ref(initialValues),
        loading = ref(false)

    const requestParams = computed(() => isRef(params) ? params.value : params)

    const run = async(runParams) => {
        if (!loading.value) {
            loading.value = true

            const actualParams = runParams ?? requestParams.value
            try {
                const res = await api_fetch({
                    url,
                    params: actualParams,
                    method
                })
                console.log('request success', res)

                response.value = formatResult ? formatResult(res) : res
                onSuccess?.(response.value, actualParams)
                console.log('request success -----', response.value)
            } catch (e) {
                console.log('err', e)
                onErr?.(e)
            } finally {
                loading.value = false
            }
        }
    }

    if (!manual) run()

    return {
        loading,
        response,
        run,
        onRefresh: () => run(requestParams.value),
    }
}