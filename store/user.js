import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { COMMON_API_PATH, useRequest } from '../fetch'
import { utils_assign_object } from '../utils'

export const useUserInfoStore = defineStore('userInfo', () => {
    const userInfo = ref({
        // 账号
        account: '',
        // id
        memberId: - 1,
        // 手机号
        phone: '',
        // token
        token: '',
        // token 过期时间
        tokenExpiration: 0,

        // 昵称
        nickname: '',
        // 头像
        avatarUrl: '',
        // vip 登记
        level: '',
        commissionPercent: null,
        // 净资产？
        totalAssets: 0,
        // 钱包余额
        amount: 0,
        // 提现冻结
        withdrawFreeze: 0,
        contractPrincipal: 0,
        totalTradersMoney: 0,
        surplusAmount: 0,
        usedAmount: 0,
        expiryAmount: null,
        count: null,
        subCount: null,
        commission: null,
        recharge: null,
        rechargeSum: null,
        status: null,
        inviteLink: null,
        backMoneyFreeze: 0,
        realBalance: null,
        isAgent: true,
        netAssets: 0,

        email: null,
        // 邀请码
        inviteCode: '',
        // 真实姓名
        realName: null,
        customerService: null,
        pid: '',
        customerServiceId: null,
        memberLevelId: 0,
        handlingFeePercent: 0,
        interestFeePercent: 0,
        withdrawAmount: 0
    })

    const onSetUserInfo = newUserInfo => {
        userInfo.value = utils_assign_object(userInfo.value, newUserInfo)
    }

    const { loading: userInfoLoading, run: userInfoRun } = useRequest({
        url: COMMON_API_PATH.USERINFO,
        manual: true,
        onSuccess: res => {
            onSetUserInfo(res)
        }
    })

    const { loading: userBaseInfoLoading, run: userBaseInfoRun } = useRequest({
        url: COMMON_API_PATH.USERINFO_BASE,
        manual: true,
        onSuccess: res => {
            onSetUserInfo(res)
        }
    })

    const onRefreshUserInfo = () => {
        Promise.all([
            userInfoRun(),
            userBaseInfoRun()
        ])
    }

    return {
        userInfo,
        loading: computed(() => userInfoLoading.value || userBaseInfoLoading.value),
        onSetUserInfo,
        onRefreshUserInfo
    }
}, {
    persist: true
})
