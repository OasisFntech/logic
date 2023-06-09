export const API_PATH = {
    // 弹窗公告
    POPUP: '/information/platformPopups',

    // 行情操作；需要拼接event传递
    DO: '/market/v2/data/doAction',
    // K 线图
    K_LINE: '/market/getKLineData',

    // 检查注册账号是否重复
    CHECK_ACCOUNT: '/auth/member/checkAccountRegister',
    // 发送短信验证码
    SEND_SMS: '/member/sms/operlog/86/',
    // 检查短信验证码
    CHECK_SMS: '/member/member/codeCheck',
    // 加密Key
    PUBLIC_KEY: '/auth/system/getPublicKey',
    // 注册
    REGISTER: '/auth/member/register'
}