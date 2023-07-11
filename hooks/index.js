import { computed } from 'vue'
import _ from 'lodash'

export * from './market'
export * from './register'
export * from './countdown'
export * from './sms'
export * from './login'
export * from './news'

export const useFormDisabled = formState => computed(() => !_.every(formState, Boolean))
