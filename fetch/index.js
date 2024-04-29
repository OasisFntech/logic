import { computed, isRef, ref } from 'vue'
import { set } from '@vueuse/core'

export * from './apis'
export * from './axios'
export * from './stocket'

import axios from './axios'
import { utils_assign_object } from '../utils'

export const FETCH_METHOD = {
    POST: 'post',
    GET: 'get',
    DELETE: 'delete',
    PUT: 'put'
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
            case FETCH_METHOD.PUT:
                return axios.put(
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

                if (res.status === 601) {
                    // 如果遇到601错误码, 则执行页面刷新操作, 方便调用出/显示出 人机验证界面
                    window.location.reload()
                    return
                }

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
        onRefresh: async() => await run(),
    }
}

const defaultResponseKeys = {
    list: 'list',
    pageSize: 'pageSize',
    pageNum: 'pageNum',
    total: 'total'
}

const defaultPaginationKeys = {
    current: 'pageNum',
    pageSize: 'pageSize',
    total: 'total',
}

export function usePagination(
    {
        fetchOptions,
        paginationOptions,
        mode,
        responseKeys,
        paginationKeys
    } = {
        mode: 'pagination'
    }
) {
    responseKeys = utils_assign_object(defaultResponseKeys,responseKeys)
    paginationKeys = utils_assign_object(defaultPaginationKeys, paginationKeys)

    const { current, pageSize, total } = paginationKeys

    const pagination = ref({
        [current]: 1,
        [pageSize]: 20,
        [total]: 0,
        ...paginationOptions
    })

    const list = ref([]),
        finished = ref(false)

    const requestParams = computed(() => {
        const baseFetchParams = isRef(fetchOptions.params) ? fetchOptions.params.value : fetchOptions.params

        return {
            ...baseFetchParams,
            [current]: pagination.value[current],
            [pageSize]: pagination.value[pageSize]
        }
    })

    const { loading, response, run } = useRequest({
        ...fetchOptions,
        params: requestParams,
        formatResult: res => {
            if (fetchOptions.formatResult) {
                return {
                    ...res,
                    [responseKeys.list]: fetchOptions.formatResult(res[responseKeys.list])
                }
            }
            return res
        },
        onSuccess: res => {
            const dataSource = res[responseKeys.list],
                resCurrent = res[responseKeys.pageNum],
                resPageSize = res[responseKeys.pageSize],
                resTotal = res[responseKeys.total]

            if (resCurrent <= 1 || mode === 'pagination') {
                list.value = dataSource
            } else {
                list.value = [
                    ...list.value,
                    ...dataSource
                ]
            }

            set(pagination, {
                ...pagination.value,
                [current]: resCurrent,
                [total]: resTotal
            })

            finished.value = !resTotal ? true : resCurrent >= resTotal / resPageSize

            fetchOptions.onSuccess?.(res, list.value)
        },
        onErr: err => {
            console.error(err)
            finished.value = true
            fetchOptions.onErr?.(err)
        }
    })

    const onRefresh = async() => {
        pagination.value[current] = 1
        await run(requestParams.value)
    }

    const onLoadMore = async() => {
        if (!finished.value){
            pagination.value[current] += 1
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

