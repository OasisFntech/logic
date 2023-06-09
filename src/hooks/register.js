import { reactive, ref, computed, onMounted } from 'vue'
import { useIntervalFn, useLocalStorage } from '@vueuse/core'
import JSEncrypt from 'jsencrypt'

import { api_fetch, API_PATH } from '../fetch'

export const useRegister = ({
    successTip,
    warnTip,
    errorTip,
    submitCallback
}) => {
    /**
     * @const formState form表单数据
     * @const checkLoading 检查账号 loading
     * @const smsLoading 发送验证码 loading
     * @const submitLoading 提交 loading
     * */
    const formState = reactive({
            username: '',
            loginPassword: '',
            repeat: '',
            phone: '',
            code: '',
            inviterPhone: ''
        }),
        checkLoading = ref(false),
        smsLoading = ref(false),
        submitLoading = ref(false)

    /**
     * @const countdown 倒计时
     * @const smsText 发送验证码动态文本
     * */
    const countdown = useLocalStorage('countdown', 0),
        smsText = computed(() => {
            return countdown.value ? `${countdown.value}s` : '发送验证码'
        })

    // 倒计时函数
    const { pause, resume } = useIntervalFn(() => {
        if (countdown.value > 0) {
            countdown.value --
        } else {
            pause()
        }
    }, 1000)

    // 开始倒计时
    const onCountdown = () => {
        countdown.value = 60
        resume()
    }

    // 页面加载时有未完成倒计时，继续倒计时
    onMounted(() => {
        if (countdown.value > 0) resume()
    })

    // 表单校验规则
    const rules = ref({
        username: [
            { required: true, message: '请输入会员账号' },
            { pattern: /^(?=.*[a-z])(?=.*\d)[a-z\d]{4,18}$/i, message: '账号格式为4-18位小写字母和数字组合' },
        ],
        phone: [
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3456789]\d{9}$/, length: 13, message: '请输入正确的手机号格式' }
        ],
        code: [
            { required: true, message: '请输入短信验证码' },
            { pattern: /^\d{6}$/, message: '请输入正确的短信验证码' }
        ],
        loginPassword: [
            { required: true, message: '请输入登录密码' },
            { pattern: /^(?=.*[a-z])(?=.*\d)[a-z\d]{6,18}$/i, message: '密码格式为6-18位小写字母和数字组合' },
        ],
        repeat: [
            { required: true, message: '请确认登录密码' },
            { pattern: /^(?=.*[a-z])(?=.*\d)[a-z\d]{6,18}$/i, message: '密码格式为6-18位小写字母和数字组合' },
            {
                validator: (_, value) => {
                    if (value !== formState.loginPassword) {
                        return Promise.reject(new Error('两次密码不一致，请重新输入'))
                    }
                    return Promise.resolve()
                }
            }
        ],
        inviterPhone: []
    })

    // 检查账号是否重复
    const onCheckAccount = async (username) => {
        if (!checkLoading.value) {
            checkLoading.value = true
            try {
                const isRepeat = await api_fetch({
                    url: API_PATH.CHECK_ACCOUNT,
                    params: {
                        username
                    }
                })

                if (isRepeat) {
                    warnTip?.('用户名已注册')
                } else {
                    successTip?.('用户名可用')
                }
            } catch (err) {
                errorTip?.(err.message)
            } finally {
                checkLoading.value = false
            }
        }
    }

    // 发送短信验证码
    const onSendSms = async (phone) => {
        if (!smsLoading.value) {
            smsLoading.value = true
            try {
                await api_fetch({
                    url: API_PATH.SEND_SMS + phone
                })
                successTip?.('短信验证码已发送，请注意查收')

                onCountdown()
            } catch (err) {
                errorTip?.(err.message)
            } finally {
                smsLoading.value = false
            }
        }
    }

    // 注册提交
    const onSubmit = async (values) => {
        if (!submitLoading.value) {
            submitLoading.value = true

            try {
                const { phone, code } = values

                // 校验短信验证码
                await api_fetch({
                    url: API_PATH.CHECK_SMS,
                    params: {
                        phone,
                        code
                    }
                })

                // 获取加密 publicKey
                const publicKey = await api_fetch({
                    url: API_PATH.PUBLIC_KEY
                })

                const encrypt = new JSEncrypt()
                encrypt.setPublicKey(publicKey)
                const loginPassword = encrypt.encrypt(values.loginPassword)

                await api_fetch({
                    url: API_PATH.REGISTER,
                    params: {
                        ...values,
                        nickName: phone,
                        userType: 1,
                        transactionPassword: '',
                        repeat: undefined,
                        loginPassword,
                        exclusiveDomain: window.location.origin
                    }
                })

                successTip?.('注册成功')
                submitCallback?.()
            } catch (err) {
                if (err?.message) errorTip?.(err.message)
            } finally {
                submitLoading.value = false
            }
        }
    }

    return {
        formState,
        rules,
        checkLoading,
        onCheckAccount,
        smsLoading,
        smsText,
        onSendSms,
        submitLoading,
        onSubmit
    }
}