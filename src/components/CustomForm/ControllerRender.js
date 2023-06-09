import { defineComponent, h } from 'vue'
import { Input, InputNumber, Select } from 'ant-design-vue'
import _ from 'lodash'

const { Password, Search } = Input

export const FORM_CONTROLLER_TYPE = {
    INPUT: 'input',
    PASSWORD: 'password',
    SELECT: 'select',
    SEARCH: 'search',
    NUMBER: 'number'
}

export default defineComponent({
    props: {
        controllerType: {
            type: String,
            required: true,
            validator(value) {
                return _.values(FORM_CONTROLLER_TYPE).includes(value)
            }
        },
        controllerProps: Object,
        modelValue: {
            type: [ String, Number ],
            required: true
        },
        slots: Object
    },
    emits: [ 'update:modelValue' ],
    setup(props, { emit }) {
        let controller = null,
            defaultProps = {
                allowClear: true
            }

        switch (props.controllerType) {
            case FORM_CONTROLLER_TYPE.INPUT:
                controller = Input
                break
            case FORM_CONTROLLER_TYPE.PASSWORD:
                controller = Password
                break
            case FORM_CONTROLLER_TYPE.SEARCH:
                controller = Search
                break
            case FORM_CONTROLLER_TYPE.NUMBER:
                controller = InputNumber
                break
            case FORM_CONTROLLER_TYPE.SELECT:
                controller = Select
                defaultProps.dropdownMatchSelectWidth = false
                defaultProps.style = {
                    minWidth: '120px'
                }
                break
        }

        return () => h(
            controller,
            {
                ...defaultProps,
                ...props.controllerProps,
                value: props.modelValue,
                'onUpdate:value': (val) => {
                    emit('update:modelValue', val)
                }
            },
            props.slots
        )
    }
})