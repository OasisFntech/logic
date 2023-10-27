<template>
    <div class="c-table">
        <HeadRender />
        
        <BodyRender />
    </div>
</template>

<script setup>
import { computed, h } from 'vue'
import classNames from 'classnames'
import _ from 'lodash'

import CTableHead from './CTableHead.vue'

const props = defineProps({
    columns: {
        type: Array,
        required: true,
    },
    dataSource: {
        type: Array,
        required: true,
    },
    hideHeader: Boolean,
    hideHeaderWithoutData: Boolean,
    headerClass: [ String, Array, Object, Function ],
    rowsClass: [ String, Array, Object, Function ],
})

const emits = defineEmits([ 'rowsClick' ])

const slots = defineSlots()

const gird = computed(() => props.columns.length)

const HeadRender = () => {
    if (props.hideHeader || (props.hideHeaderWithoutData && !props.dataSource.length)) {
        return null
    } else {
        return h(
            'div',
            {
                class: classNames(
                    [ 'c-table__thead-row min-h-[40px]' ],
                    _.isFunction(props.headerClass) ? props.headerClass() : props.headerClass,
                ),
                style: {
                    gridTemplateColumns: `repeat(${gird.value}, minmax(0, 1fr))`,
                },
            },
            props.columns.map(e => {
                const { title, dataIndex, sorter, align } = e
                let alignClass = ''
                
                switch (align) {
                    case 'left':
                        alignClass = 'text-left'
                        break
                    case 'right':
                        alignClass = 'text-right'
                        break
                    default:
                        alignClass = 'text-center'
                        break
                }
                
                return h(
                    CTableHead,
                    {
                        sorter,
                        dataIndex,
                        class: alignClass
                    },
                    () => title,
                )
            }),
        )
    }
}

const BodyRender = () => {
    if (props.dataSource.length) {
        return props.dataSource.map((d, index) => {
            const classnames = classNames(
                [ 'c-table__tbody-row min-h-[40px]' ],
                _.isFunction(props.rowsClass) ? props.rowsClass(d) : props.rowsClass,
            )
            
            return h(
                'div',
                {
                    class: classnames,
                    style: {
                        gridTemplateColumns: `repeat(${gird.value}, minmax(0, 3fr))`,
                    },
                    onClick: () => {
                        emits('rowsClick', d)
                    },
                },
                props.columns.map(c => {
                    const { dataIndex, render, bodyClassName, align } = c
                    let bodyClasses = ''
                    
                    switch (align) {
                        case 'left':
                            bodyClasses = classNames(bodyClassName, 'text-left')
                            break
                        case 'right':
                            bodyClasses = classNames(bodyClassName, 'text-right')
                            break
                        default:
                            bodyClasses = classNames(bodyClasses, 'text-center')
                            break
                    }
                    
                    let value = d[dataIndex] ?? '-',
                        childVNode = value
                    
                    if (render) {
                        childVNode = render({ value, record: d, index })
                        
                        if (typeof childVNode === 'function') {
                            return h(childVNode, { class: bodyClasses })
                        }
                    }
                    
                    return h(
                        'div',
                        {
                            class: bodyClasses,
                        },
                        childVNode,
                    )
                }),
            )
        })
    } else {
        return slots?.empty
    }
}

defineOptions({ name: 'CTable' })
</script>

<style scoped>
.c-table {
    @apply text-sm;
}

:deep(.c-table__thead-row),
:deep(.c-table__tbody-row) {
    @apply grid items-center min-h-[32px];
}
</style>
