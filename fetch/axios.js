import axios from 'axios'

function axiosDefaultConfig(config) {
    Object.entries(config).forEach(e => {
        const [ key, val ] = e

        axios.defaults[key] = val
    })
}

function onFetchErr(err) {
    console.error(err)
    return Promise.reject(err)
}

function axiosInterceptors({ request, response }) {
    axios.interceptors.request.use(request, onFetchErr)
    axios.interceptors.response.use(response, onFetchErr)
}

export {
    axios,
    axiosInterceptors,
    axiosDefaultConfig,
    onFetchErr
}
