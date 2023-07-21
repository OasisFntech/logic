export const API_PATH = {
    /** 系统类 */
    // 弹窗公告
    POPUP: '/information/platformPopups',

    // api 域名列表
    API_DOMAIN: '/check/domains/getApiDmian',
    // api域名检查
    API_CHECK: '/check/systemConfigCheck/getCheck',
    // 用于访问的前端域名站
    WEB_DOMAIN: '/check/domains/getWebDmian',

    // 站点配置项
    PC_CONFIG: '/member/systemConfig/getPCSiteConfig',
    SITE_CONFIG: '/member/systemConfig/getSiteConfig',
    // 基础信息 ps:重复接口数据可优化
    BASE_INFO: '/member/systemConfig/getSystemConfigValue',
    // 获取客服信息
    SERVICE: '/member/systemConfig/getCustomerServiceLink',
    /** 系统类 */

    /** 股票行情 */
    // 行情操作；需要拼接event传递
    DO: '/market/v2/data/doAction',
    // K 线图
    K_LINE: '/market/getKLineData',
    /** 股票行情 */

    /** 登录注册 */
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
    MOBILE_LOGIN: '/auth/member/verificationLogin',
    /** 登录注册 */

    /** 新闻类 */
    // A股新闻
    NEWS_STOCK: '/market/getNewsStockList',
    // 要闻
    NEWS: '/information/yaowen',
    // 快讯
    NEWS_FLASH: '/information/preview/save',
    /** 新闻类 */

    /** 用户类 */
    // 用户信息
    USERINFO: '/member/member/getMyPageData',
    USERINFO_BASE: '/member/member/getMemberBaseInfo'
    /** 用户类 */
}
