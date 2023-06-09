import { ref, computed, onBeforeUnmount } from 'vue'
import _ from 'lodash'

import { CHART_TYPE, CHART_TYPES_CONFIG } from '../config'
import {
    ECHART_CONFIG,
    MINUTES_RANGE,
    utils_amountFormatter,
    utils_base64
} from '../utils'
import {
    API_PATH,
    api_fetch,
    useRequest,
    doParams,
    KLINE_URL,
    TOTAL_MARKET_SOCKET,
    KLINE_REAL_TIME_SOCKET,
    KLINE_ONE_MINUTES_SOCKET,
    KLINE_FIVE_MINUTES_SOCKET,
    KLINE_FIFTEEN_MINUTES_SOCKET,
    KLINE_THIRTY_MINUTES_SOCKET,
    RAISE_FALL_SOCKET
} from '../fetch'

export const useMarketHooks = () => {
    // 当前大盘的股票代码
    const totalMarketCode = ref(''),
        // 当前行情图表类型
        chartType = ref(CHART_TYPES_CONFIG[0].key)

    TOTAL_MARKET_SOCKET.on(res => {
        totalMarket.value = res
    })

    // 大盘指数数据
    const { response: totalMarket } = useRequest({
        url: `${API_PATH.DO}?event=${KLINE_URL.TOTAL_MARKETS}`,
        params: doParams([]),
        initialValues: {
            fellNum: 0,
            flatNum: 0,
            hotConcept: [],
            hotIndustry: [],
            increaseArea: {},
            indexPlate: [],
            roseNum: 0,
            stockStatus: ''
        },
        formatResult: res => utils_base64(res),
        onSuccess: res => {
            if (res.indexPlate.length) {
                TOTAL_MARKET_SOCKET.emit('')

                // 初始化默认第一个大盘指数代码
                onChangeTotalMarket(res.indexPlate[0].indexCode)
            }
        }
    })

    // 修改当前大盘指数
    const onChangeTotalMarket = (stockCode) => {
        totalMarketCode.value = stockCode
        onChangeKLineType(chartType.value)

        // 获取大盘对应涨跌幅数据
        onChangeRaiseFallType(raiseFallType.value)
    }

    /**
     * @function onChangeKLineType
     * @param type | CHART_TYPE
     * @description 切换行情图类型
     * */
    const onChangeKLineType = async (type) => {
        chartType.value = type
        onCloseAllSocket()

        switch (type) {
            // 分时
            case CHART_TYPE.REAL_TIME:
                await onGetDoAction(KLINE_URL.REAL_TIME)
                // 打开分时K线图socket
                KLINE_REAL_TIME_SOCKET.emit(totalMarketCode.value)
                break
            // 日K
            case CHART_TYPE.DAILY:
                onGetKLine(0)
                break
            // 周K
            case CHART_TYPE.WEEKLY:
                onGetKLine(1)
                break
            // 月K
            case CHART_TYPE.MONTHLY:
                onGetKLine(2)
                break
            // 1分
            case CHART_TYPE.ONE_MINUTES:
                await onGetDoAction(KLINE_URL.ONE_MINUTES)
                // 打开 1分 K线图socket
                KLINE_ONE_MINUTES_SOCKET.emit(totalMarketCode.value)
                break
            // 5分
            case CHART_TYPE.FIVE_MINUTES:
                await onGetDoAction(KLINE_URL.FIVE_MINUTES)
                // 打开 5分 K线图socket
                KLINE_FIVE_MINUTES_SOCKET.emit(totalMarketCode.value)
                break
            // 15分
            case CHART_TYPE.FIFTEEN_MINUTES:
                await onGetDoAction(KLINE_URL.FIFTEEN_MINUTES)
                // 打开分15分 线图socket
                KLINE_FIFTEEN_MINUTES_SOCKET.emit(totalMarketCode.value)
                break
            // 30分
            case CHART_TYPE.THIRTY_MINUTES:
                await onGetDoAction(KLINE_URL.THIRTY_MINUTES)
                // 打开分30分 线图socket
                KLINE_THIRTY_MINUTES_SOCKET.emit(totalMarketCode.value)
                break
        }
    }


    // 分时，1、5、15、30分 数据使用接口
    const onGetDoAction = async (url) => {
        const res = await api_fetch({
            url: `${API_PATH.DO}?event=${url}`,
            params: doParams([ totalMarketCode.value ])
        })

        const resParse = utils_base64(res)

        // 分时渲染图表
        if (url === KLINE_URL.REAL_TIME) renderRealTimeChart(resParse)
        // 1、5、15、30分 K线图渲染图表
        else renderKLineChart(resParse.kLineData)
    }

    // 行情图表配置项
    const option = ref({})
    // 获取涨跌颜色值
    const rootStyle = getComputedStyle(document.documentElement),
        raiseColor = rootStyle.getPropertyValue('--raise'),
        fallColor = rootStyle.getPropertyValue('--fall')

    // 渲染分时图
    const renderRealTimeChart = (dataSource) => {
        /**
         * @const chartData 图表数据
         * @const timeData 时间数据
         * @const priceData 价格数据
         * @const volData 底部体积图数据
         * */
        const chartData = dataSource.minuteKDataVOList.slice(1),
            priceData = [],
            volData = [],
            increaseData = []

        if (!chartData.length) return

        let { increase: minIncrease } = _.minBy(chartData, 'increase'),
            { increase: maxIncrease } = _.maxBy(chartData, 'increase')

        if (maxIncrease < Math.abs(minIncrease)) {
            maxIncrease = Math.abs(minIncrease)
        } else {
            minIncrease = Number('-' + maxIncrease)
        }

        const minPrice = (minIncrease / 100 * dataSource.yClose) + dataSource.yClose,
            maxPrice = (maxIncrease / 100 * dataSource.yClose) + dataSource.yClose

        chartData.forEach(e => {
            priceData.push(e.price)
            volData.push(e.vol)
            increaseData.push(e.increase)
        })

        option.value = {
            tooltip: {
                ...ECHART_CONFIG.TOOLTIP,
                // hover 展示内容
                formatter: (series) => {
                    const currentIndex = series[0].dataIndex,
                        currentData = chartData[currentIndex],
                        trendColor = currentData.price > dataSource.yClose ? raiseColor : fallColor

                    const renderConfig = [
                        {
                            title: '时间',
                            content: utils_timeParser(currentData.time, 3)
                        },
                        {
                            title: '价格',
                            content: currentData.price.toFixed(2),
                            color: trendColor
                        },
                        {
                            title: '均价',
                            content: currentData.avPrice,
                            color: trendColor
                        },
                        {
                            title: '涨跌幅',
                            content: currentData.increase + '%',
                            color: trendColor
                        },
                        {
                            title: '成交量',
                            content: utils_amountFormatter(currentData.vol)
                        },
                        {
                            title: '成交额',
                            content: utils_amountFormatter(currentData.amount)
                        }
                    ]

                    return `
                        <div>
                            ${renderConfig.map(utils_renderTooltip).join('')}
                        </div>
                    `
                },
            },
            axisPointer: ECHART_CONFIG.AXIS_POINTER,
            grid: ECHART_CONFIG.GRID,
            xAxis: [
                {
                    type: 'category',
                    data: MINUTES_RANGE,
                    boundaryGap: false,
                    axisLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: '#303b4b',
                        },
                    },
                    axisLabel: {
                        show: false
                    },
                    axisTick: {
                        show: false,
                        lineStyle: {
                            color: '#303b4b',
                        },
                    },
                    splitLine: {
                        show: false
                    },
                    axisPointer: {
                        show: true,
                        label: {
                            show: false
                        },
                    }
                },
                {
                    type: 'category',
                    boundaryGap: false,
                    data: MINUTES_RANGE,
                    gridIndex: 1,
                    axisLine: {
                        lineStyle: {
                            type: 'solid',
                            color: '#303b4b',
                        },
                    },
                    axisLabel: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            yAxis: [
                {
                    scale: false,
                    min: minPrice,
                    max: maxPrice,
                    splitNumber: 8,
                    interval: (maxPrice - minPrice) / 8,
                    axisPointer: {
                        show: true,
                        label: {
                            precision: 2,
                        },
                    },
                    splitLine: {
                        show: false
                    },
                    // 左侧文本
                    axisLabel: {
                        color: (params, index) => {
                            if (index === 4) return '#fafafa'
                            const value = Number(params).toFixed(2)
                            if (value > dataSource.yClose) {
                                return raiseColor
                            } else if (value < dataSource.yClose) {
                                return fallColor
                            }
                        },
                        formatter: val => val.toFixed(2)
                    }
                },
                // 底部 Volume Y 轴配置
                {
                    scale: true,
                    gridIndex: 1,
                    show: false,
                    axisPointer: {
                        label: {
                            formatter: ({ value }) => utils_amountFormatter(value)
                        }
                    }
                },
                {
                    scale: false,
                    min: minIncrease,
                    max: maxIncrease,
                    splitNumber: 8,
                    interval: (maxIncrease - minIncrease) / 8,
                    splitLine: { show: false },
                    axisPointer: {
                        //指示器参数
                        show: true,
                        label: {
                            precision: 2,
                            formatter: ({ value }) => Number(value).toFixed(2) + '%'
                        },
                    },
                    axisLabel: {
                        color: (params, index) => {
                            if (index === 4) return '#fafafa'
                            if (params > 0) {
                                return raiseColor
                            } else if (params < 0) {
                                return fallColor
                            }
                        },
                        formatter: val => Number(val).toFixed(2) + '%'
                    }
                }
            ],
            series: [
                {
                    name: 'Price',
                    data: priceData,
                    type: 'line',
                    smooth: true,
                    itemStyle: {
                        color: '#0ab8fa',
                        borderWidth: 1
                    },
                    // 渐变背景色
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: 'rgba(80, 141, 255, .39)'
                                },
                                {
                                    offset: .34,
                                    color: 'rgba(56, 155, 255, .25)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(38, 197, 254, 0)'
                                }
                            ]
                        }
                    }
                },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: volData,
                    itemStyle: {
                        color: ({ dataIndex }) => {
                            if (
                                chartData[dataIndex].open <=
                                chartData[dataIndex].price
                            ) {
                                return raiseColor
                            } else {
                                return fallColor
                            }
                        }
                    }
                },
                {
                    name: 'Raise_Fall',
                    type: 'none',
                    data: increaseData
                }
            ]
        }
    }

    // 获取 K 线图数据；日K、周K、月K
    const onGetKLine = async (period) => {
        const { kLineData } = await api_fetch({
            url: API_PATH.K_LINE,
            params: {
                period,
                stockCode: totalMarketCode.value,
                type: 1
            }
        })

        renderKLineChart(kLineData)
    }

    // 渲染 K 线图
    const renderKLineChart = (dataSource) => {
        const dateData = [],
            priceData = [],
            volData = []

        dataSource.forEach(e => {
            dateData.push(
                utils_timeParser(e[0], 8)
            )

            priceData.push(e.slice(1, 5))

            volData.push(e[7])
        })

        const MA5 = utils_kLineCalculateMA(5, priceData),
            MA10 = utils_kLineCalculateMA(10, priceData),
            MA20 = utils_kLineCalculateMA(20, priceData)

        option.value = {
            tooltip: {
                ...ECHART_CONFIG.TOOLTIP,
                // hover 展示内容
                formatter: (series) => {
                    const currentIndex = series[0].dataIndex,
                        currentData = dataSource[currentIndex],
                        lastDataEndPrice = dataSource[currentIndex - 1][5] ?? 0,
                        raise_fall = _.multiply((currentData[5] - currentData[1]) / currentData[1], 100)

                    const renderConfig = [
                        {
                            title: '时间',
                            content: utils_timeParser(currentData[0], 8)
                        },
                        {
                            title: '开盘',
                            content: currentData[2],
                            color: currentData[2] > lastDataEndPrice ? raiseColor : fallColor
                        },
                        {
                            title: '最高',
                            content: currentData[3],
                            color: currentData[3] > lastDataEndPrice ? raiseColor : fallColor
                        },
                        {
                            title: '最低',
                            content: currentData[4],
                            color: currentData[4] > lastDataEndPrice ? raiseColor : fallColor
                        },
                        {
                            title: '收盘',
                            content: currentData[5],
                            color: currentData[5] > lastDataEndPrice ? raiseColor : fallColor
                        },
                        {
                            title: '涨跌幅',
                            content: raise_fall.toFixed(2) + '%',
                            color: raise_fall > 0 ? raiseColor : fallColor
                        },
                        {
                            title: '成交量',
                            content: utils_amountFormatter(currentData[6])
                        },
                        {
                            title: '成交额',
                            content: utils_amountFormatter(currentData[7])
                        },
                        {
                            title: 'MA5',
                            content: MA5[currentIndex],
                            color: '#fac324'
                        },
                        {
                            title: 'MA10',
                            content: MA10[currentIndex],
                            color: '#0ba8de'
                        },
                        {
                            title: 'MA20',
                            content: MA20[currentIndex],
                            color: '#d60ccc'
                        }
                    ]

                    return `
                        <div>
                            ${renderConfig.map(utils_renderTooltip).join('')}
                        </div>
                    `
                },
            },
            axisPointer: ECHART_CONFIG.AXIS_POINTER,
            grid: ECHART_CONFIG.GRID,
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [ 0, 1 ],
                    start: 50,
                    end: 100,
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: dateData,
                    boundaryGap: false,
                    axisLabel: {
                        show: false
                    },
                    axisLine: { onZero: false },
                    splitLine: { show: false },
                    axisPointer: {
                        z: 100,
                        label: {
                            show: false
                        }
                    }
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: dateData,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false }
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitNumber: 5,
                    axisLine: { show: true, lineStyle: { color: '#303b4b' } },
                    axisTick: {
                        lineStyle: {
                            show: false,
                            color: '#303b4b',
                        },
                    },
                    splitLine: {
                        show: false, // 去掉网格线
                        lineStyle: {
                            color: [ '#303b4b' ],
                            width: 1,
                            type: 'solid',
                        },
                    },
                    axisLabel: {
                        show: false
                    }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    axisLabel: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    axisPointer: {
                        label: {
                            formatter: ({ value }) => utils_amountFormatter(value)
                        }
                    }
                }
            ],
            series: [
                {
                    type: 'candlestick',
                    data: priceData
                },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: volData,
                    itemStyle: {
                        color: ({ dataIndex }) => {
                            if (
                                Number(dataSource[dataIndex][2]) <=
                                Number(dataSource[dataIndex][5])
                            ) {
                                return raiseColor
                            } else {
                                return fallColor
                            }
                        },
                    },
                },
                {
                    lineStyle: { width: 1, color: '#fac324' },
                    name: 'MA5',
                    showSymbol: false,
                    smooth: true,
                    symbol: 'none',
                    type: 'line',
                    data: MA5
                },
                {
                    lineStyle: { width: 1, color: '#0ba8de' },
                    name: 'MA10',
                    showSymbol: false,
                    smooth: true,
                    symbol: 'none',
                    type: 'line',
                    data: MA10
                },
                {
                    lineStyle: { width: 1, color: '#d60ccc' },
                    name: 'MA20',
                    showSymbol: false,
                    smooth: true,
                    symbol: 'none',
                    type: 'line',
                    data: MA20
                }
            ]
        }
    }

    // 涨跌幅类型
    const raiseFallType = ref(1)
    // 涨跌幅请求参数
    const raiseFallParams = computed(() => {
        let code = 'CNA.ci'

        switch (totalMarketCode.value) {
            // 上证指数
            case '000001.sh':
                code = 'SHA.ci'
                break
            // 深证成数
            case '399001.sz':
                code = 'SZA.ci'
                break
            // 创业板指
            case '399006.sz':
                code = 'GEM.ci'
                break
        }

        return [
            code,
            '',
            '',
            `${raiseFallType.value}`,
            'increase',
            '0',
            '8'
        ]
    })

    RAISE_FALL_SOCKET.on(res => {
        raiseFallData.value = res
    })

    const {
        response: raiseFallData,
        run: raiseFallRun,
        loading: raiseFallLoading
    } = useRequest({
        url: `${API_PATH.DO}?event=${KLINE_URL.RAISE_FALL}`,
        manual: true,
        initialValues: [],
        formatResult: res => utils_base64(res),
        onSuccess: () => {
            RAISE_FALL_SOCKET.emit(raiseFallParams.value)
        }
    })

    // 修改涨跌幅类型
    const onChangeRaiseFallType = async (type) => {
        if (!raiseFallLoading.value) {
            try {
                raiseFallType.value = type
                await raiseFallRun(doParams(raiseFallParams.value))
            } finally {
                raiseFallLoading.value = false
            }
        }
    }

    KLINE_REAL_TIME_SOCKET.on(renderRealTimeChart)
    const minutesCallback = res => { renderKLineChart(res.kLineData) }
    KLINE_ONE_MINUTES_SOCKET.on(minutesCallback)
    KLINE_FIVE_MINUTES_SOCKET.on(minutesCallback)
    KLINE_FIFTEEN_MINUTES_SOCKET.on(minutesCallback)
    KLINE_THIRTY_MINUTES_SOCKET.on(minutesCallback)

    const onCloseAllSocket = () => {
        // 关闭所有socket
        KLINE_REAL_TIME_SOCKET.close()
        KLINE_ONE_MINUTES_SOCKET.close()
        KLINE_FIVE_MINUTES_SOCKET.close()
        KLINE_FIFTEEN_MINUTES_SOCKET.close()
        KLINE_THIRTY_MINUTES_SOCKET.close()
    }

    onBeforeUnmount(() => {
        TOTAL_MARKET_SOCKET.close()
        RAISE_FALL_SOCKET.close()

        onCloseAllSocket()
    })

    return {
        totalMarketCode,
        totalMarket,
        chartType,
        onChangeTotalMarket,
        onChangeKLineType,
        option,
        renderRealTimeChart,
        raiseFallType,
        raiseFallData,
        raiseFallLoading,
        onChangeRaiseFallType
    }
}