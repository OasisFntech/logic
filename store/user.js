import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import _ from 'lodash'

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
        // vip 等级
        level: '',
        commissionPercent: null,
        // 总资产
        totalAssets: '--',
        // 钱包余额
        amount: '--',
        // 提现冻结
        withdrawFreeze: '--',
        // 合约净资产
        contractPrincipal: '--',
        // 总操盘资金
        totalTradersMoney: '--',
        // 未使用
        surplusAmount: '--',
        // 已使用
        usedAmount: '--',
        expiryAmount: null,
        count: null,
        subCount: null,
        commission: null,
        recharge: null,
        rechargeSum: null,
        status: null,
        inviteLink: null,
        backMoneyFreeze: '--',
        realBalance: null,
        isAgent: true,
        netAssets: '--',

        email: null,
        // 邀请码
        inviteCode: '',
        // 真实姓名
        realName: null,
        customerService: null,
        pid: '',
        customerServiceId: null,
        memberLevelId: '--',
        handlingFeePercent: '--',
        interestFeePercent: '--',
        withdrawAmount: '--'
    })

    const onSetUserInfo = newUserInfo => {
        userInfo.value = utils_assign_object(userInfo.value, newUserInfo)
    }

    const { loading: userInfoLoading, run: userInfoRun } = useRequest({
        url: COMMON_API_PATH.USERINFO,
        manual: true,
        onSuccess: res => {
            delete res.amount
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

export const useMessageStore = defineStore('message', () => {
    const hasUnread = ref(false)

    const { response, onRefresh } = useRequest({
        url: COMMON_API_PATH,
        initialValues: {
            isSystemMessages: null,
            isStandInsideLetters: false,
            isAnnouncementMessages: null,
            isStockWarning: false
        },
        onSuccess: res => {
            if (_.values(res).some(Boolean)) hasUnread.value = true
        }
    })

    return {
        hasUnread,
        readStatus: response,
        onRefreshReadStatus: onRefresh
    }
})
