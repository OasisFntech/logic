import { ref } from 'vue'
import { defineStore } from 'pinia'

import { API_PATH, useRequest } from '../fetch'

export const useUserInfoStore = defineStore('userInfo', () => {
    const userInfo = ref({
        account: '',
        memberId: -1,
        phone: '',
        token: '',
        tokenExpiration: 0,

        nickname: '',
        avatarUrl: '',
        level: '',
        commissionPercent: null,
        totalAssets: 0,
        amount: 0,
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
        netAssets: 0
    })

    const onSetUserInfo = newUserInfo => {
        userInfo.value = {
            ...userInfo.value,
            ...newUserInfo
        }
    }

    const { loading, run } = useRequest({
        url: API_PATH.USERINFO,
        manual: true,
        onSuccess: res => {
            onSetUserInfo(res)
        }
    })


    const onRefreshUserInfo = async() => {
        await run({
            memberId: userInfo.value.memberId,
            account: userInfo.value.account
        })
    }

    return {
        userInfo,
        loading,
        onSetUserInfo,
        onRefreshUserInfo
    }
})
