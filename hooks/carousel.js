import { useRequest, COMMON_API_PATH, FETCH_METHOD } from '../fetch'

export const useCarousel = (device) => {
    const { response } = useRequest({
        url: `${COMMON_API_PATH.CAROUSEL}/${device}`,
        method: FETCH_METHOD.GET,
        initialValues: [],
    })

    return { carousel: response }
}
