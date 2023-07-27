import SocketIO from 'socket.io-client'
import { v4 } from 'uuid'

import { utils_base64 } from '../utils'

const deviceID = 'webclip_' + v4()

export const SOCKET_EVENTS = {
    SUBSCRIBE: 'subscribe',
    UNSUBSCRIBE: 'unsubscribe'
}

export let socket = null

export const createSocket = (socketUri) => {
    if (!socket) {
        socket = SocketIO(
            `${socketUri}?deviceID=${deviceID}`,
            {
                transports: [ 'websocket' ],
                deviceID,
            }
        )

        socket.on('connect', (con) => {
            console.log('socket connected successfully')
        })
    }
}

// K线图请求地址
export const SOCKET_URL = {
    // 股票总数据
    TOTAL_MARKETS: 'blocksDetail',
    // 涨跌幅
    RAISE_FALL: 'blockMember',

    // 分时、1分、5分、15分、30分
    REAL_TIME: 'kLineRealTime',
    ONE_MINUTES: 'kLineBy1Minutes',
    FIVE_MINUTES: 'kLineBy5Minutes',
    FIFTEEN_MINUTES: 'kLineBy15Minutes',
    THIRTY_MINUTES: 'kLineBy30Minutes',

    // 每次价格成交变动详情
    STEP_DETAILS: 'itemByStepDetails',

    STOCK_DETAILS: 'foundsDetail'
}

// do 接口参数整合
export const doParams = (params, payload) => ({
    event: SOCKET_EVENTS.SUBSCRIBE,
    isCompress: true,
    params,
    uuid: v4(),
    ...payload
})

/**
 * @class KLineSocket Socket 对象
 * @constructor url 创建socket的event事件
 * @emit 发送事件
 * @on 监听事件 传送回调参数
 * @close 关闭socket连接
 * */
class KLineSocket {
    constructor(event) {
        this.event = event
        this.active = false
    }
    emit(params, payload) {
        if (socket) {
            socket.emit(
                this.event,
                doParams( typeof params === 'object' ? params : [ params ], payload)
            )
            this.active = true
        }
    }
    on(callback) {
        if (socket) {
            socket.on(this.event, ({ code, data }) => {
                if (code === 1) {
                    callback(
                        utils_base64(data)
                    )
                }
            })
        }
    }
    close() {
        if (this.active && socket) {
            socket.emit(
                this.event,
                {
                    event: SOCKET_EVENTS.UNSUBSCRIBE
                }
            )
            this.active = false
        }
    }
}

// 大盘指数
export const TOTAL_MARKET_SOCKET = new KLineSocket(SOCKET_URL.TOTAL_MARKETS)
// 涨跌幅
export const RAISE_FALL_SOCKET = new KLineSocket(SOCKET_URL.RAISE_FALL)

// 分时K线图socket
export const KLINE_REAL_TIME_SOCKET = new KLineSocket(SOCKET_URL.REAL_TIME)
export const KLINE_ONE_MINUTES_SOCKET = new KLineSocket(SOCKET_URL.ONE_MINUTES)
export const KLINE_FIVE_MINUTES_SOCKET = new KLineSocket(SOCKET_URL.FIVE_MINUTES)
export const KLINE_FIFTEEN_MINUTES_SOCKET = new KLineSocket(SOCKET_URL.FIFTEEN_MINUTES)
export const KLINE_THIRTY_MINUTES_SOCKET = new KLineSocket(SOCKET_URL.THIRTY_MINUTES)

// 每次价格成交变动详情
export const STEP_DETAILS_SOCKET = new KLineSocket(SOCKET_URL.STEP_DETAILS)

export const STOCK_DETAILS_SOCKET = new KLineSocket(SOCKET_URL.STOCK_DETAILS)
