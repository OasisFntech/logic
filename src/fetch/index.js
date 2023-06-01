import axios from 'axios'
import { ref, computed, isRef } from 'vue'

function axiosDefaultConfig(config) {
    Object.entries(config).forEach(e => {
        const [ key, val ] = e

        axios.defaults[key] = val
    })
}

function axiosInterceptors({ request, response }) {
    axios.interceptors.request.use(request)
    axios.interceptors.response.use(response)
}

const FETCH_METHOD = {
    POST: 'post',
    GET: 'get',
    DELETE: 'delete'
}

function api_fetch({ url, params, method = 'post' }) {
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

function useRequest({
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
        loading = ref()

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

                response.value = formatResult ? formatResult(res) : res
                onSuccess?.(response.value, actualParams)
            } catch (e) {
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

module.exports = {
    api_fetch,
    useRequest,
    axiosInterceptors,
    axiosDefaultConfig,
    FETCH_METHOD
}
