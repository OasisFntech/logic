import dayjs from 'dayjs'
import _ from 'lodash'

// echart 图表通用配置 K 线图
export const ECHART_CONFIG = {
    TOOLTIP: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        },
        textStyle: {
            fontSize: 12
        },
        position: function (pos, params, el, elRect, size) {
            const obj = {
                top: 10
            }
            obj[[ 'left', 'right' ][+(pos[0] < size.viewSize[0] / 2)]] = 30
            return obj
        },
    },
    AXIS_POINTER: {
        link: { xAxisIndex: 'all' },
    },
    GRID: [
        {
            left: '12%',
            top: '8%',
            right: '10%',
            height: '60%'
        },
        {
            left: '12%',
            right: '10%',
            top: '70%',
            height: '16%'
        }
    ]
}

// 图表类型
export const CHART_TYPE = {
    // 分时
    REAL_TIME: 'realTime',
    // 日K
    DAILY: 'daily',
    // 周K
    WEEKLY: 'weekly',
    // 月K
    MONTHLY: 'monthly',
    // 1分
    ONE_MINUTES: 'minute',
    // 5分
    FIVE_MINUTES: 'five_minutes',
    // 15分
    FIFTEEN_MINUTES: 'fifteen_minutes',
    // 30分
    THIRTY_MINUTES: 'thirty_minutes'
}

// 图表类型渲染配置
export const CHART_TYPES_CONFIG = [
    {
        key: CHART_TYPE.REAL_TIME,
        title: '分时'
    },
    {
        key: CHART_TYPE.DAILY,
        title: '日K'
    },
    {
        key: CHART_TYPE.WEEKLY,
        title: '周K'
    },
    {
        key: CHART_TYPE.MONTHLY,
        title: '月K'
    },
    {
        key: CHART_TYPE.ONE_MINUTES,
        title: '1分'
    },
    {
        key: CHART_TYPE.FIVE_MINUTES,
        title: '5分'
    },
    {
        key: CHART_TYPE.FIFTEEN_MINUTES,
        title: '15分'
    },
    {
        key: CHART_TYPE.THIRTY_MINUTES,
        title: '30分'
    },
]

const today = dayjs().format('YYYY-MM-DD')
const generateMinuteRange = (startTime, endTime) => {
    const start = dayjs(`${today} ${startTime}`),
        end = dayjs(`${today} ${endTime}`),
        minutes = end.diff(start, 'minute') + 1

    return _.range(minutes).map((index) => start.add(index, 'minute').format('HH:mm'))
}

const morningRange = generateMinuteRange('09:30', '11:29'),
    afternoonRange = generateMinuteRange('13:01', '15:00')

// 分时时间段数据
export const minuteRange = _.concat(morningRange, '11:30/13:00', afternoonRange)

/**
 * @function timeParser
 * @param time 时间内容
 * @param timeType 时间类型 3 | 8
 * @description 3是分时的时间 930 类型；8是k线图 20230530 类型
 * */
export const utils_timeParser = (time, timeType) => {
    switch (timeType) {
        case 3:
            const hours = time.length === 3 ? `0${time[0]}` : time.slice(0, 2)

            return `${hours}:${time.slice(-2)}`
        case 8:
            return dayjs(time).format('YYYY/MM/DD')
        default:
            return time
    }
}

// 渲染 echart 的 tooltip
export const utils_renderTooltip = ({ title, content, color }) => {
    return `
        <div>
            ${title}：
            <span style="color: ${color || 'inherit'}">
                ${content}
            </span>
        </div>
    `
}

/**
 * @function utils_kLineCalculateMA
 * @param dayCount 日均数
 * @param data 数据源
 * @return array<number>
 * @description 计算K线图日均线
 * */
export const utils_kLineCalculateMA = (dayCount, data) => {
    const result = []

    for (let i = 0; i < data.length; i++) {
        if (i < dayCount) {
            result.push('-')
            continue
        }

        const sum = _.sumBy(_.slice(data, i - dayCount, i), value => +value[1])
        result.push((sum / dayCount).toFixed(2))
    }

    return result
}