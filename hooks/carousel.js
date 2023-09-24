import { useRequest, COMMON_API_PATH, FETCH_METHOD } from '../fetch'

export const useCarousel = () => {
    const { response } = useRequest({
        url: COMMON_API_PATH.CAROUSEL,
        method: FETCH_METHOD.GET,
        initialValues: [],
    })

    return { carousel: response }
}
