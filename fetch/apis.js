export const API_PATH = {
    // 弹窗公告
    POPUP: '/information/platformPopups',

    // 行情操作；需要拼接event传递
    DO: '/market/v2/data/doAction',
    // K 线图
    K_LINE: '/market/getKLineData',

    // 检查注册账号、手机号是否注册过
    CHECK_ACCOUNT_REGISTER: '/auth/member/checkAccountRegister',
    CHECK_MOBILE_REGISTER: '/auth/member/checkPhoneRegister',
    // 发送短信验证码
    SEND_SMS: '/member/sms/operlog/86/',
    // 检查短信验证码
    CHECK_SMS: '/member/member/codeCheck',
    // 密码加密公钥
    PUBLIC_KEY: '/auth/system/getPublicKey',
    // 注册
    REGISTER: '/auth/member/register',

    // 账号密码登录
    ACCOUNT_LOGIN: '/auth/member/login',
    // 手机号登录
    MOBILE_LOGIN: 'auth/member/verificationLogin'
}