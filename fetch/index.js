import { computed, isRef, ref } from 'vue'
import { set } from '@vueuse/core'

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

export function usePagination(fetchOptions, paginationOptions, mode = 'pagination') {
    const pagination = ref({
        current: 1,
        pageSize: 20,
        total: 0,
        ...paginationOptions
    })

    const list = ref([]),
        finished = ref(false)

    const requestParams = computed(() => {
        const baseFetchParams = isRef(fetchOptions.params) ? fetchOptions.params.value : fetchOptions.params,
            { current, pageSize } = pagination.value

        return {
            ...baseFetchParams,
            pageNum: current,
            pageSize
        }
    })

    const { loading, response, run } = useRequest({
        ...fetchOptions,
        params: requestParams,
        formatResult: res => {
            if (fetchOptions.formatResult) {
                return {
                    ...res,
                    list: fetchOptions.formatResult(res.list)
                }
            }
            return res
        },
        onSuccess: res => {
            const { list: dataSource, pageNum, pageSize, total } = res

            if (pageNum === 1 || mode === 'pagination') {
                list.value = dataSource
            } else {
                list.value = [
                    ...list.value,
                    ...dataSource
                ]
            }

            set(pagination, {
                ...pagination.value,
                current: pageNum,
                pageSize: pageSize,
                total: total
            })

            finished.value = pageNum >= total / pageSize
        }
    })

    const onRefresh = async() => {
        pagination.value.current = 1
        await run(requestParams.value)
    }

    const onLoadMore = async() => {
        if (!finished.value){
            pagination.value.current += 1
            await run(requestParams.value)
        }
    }

    const onChange = async(_pagination) => {
        pagination.value = {
            ...pagination.value,
            ..._pagination
        }
        await run(requestParams.value)
    }

    return {
        loading,
        list,
        response,
        pagination,
        finished,
        run,
        onRefresh,
        onLoadMore,
        onChange
    }
}