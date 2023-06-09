<template>
    <Form
        v-bind="formProps"
        layout="vertical"
        @finish="$emit('finish', $event)"
    >
        <Row :gutter="[ 16 ]">
            <template v-for="({ itemProps, controllerType, controllerProps, slots }) in formConfig" :key="itemProps.name">
                <Col :span="colSpan">
                    <FormItem v-bind="itemProps">
                        <ControllerRender
                            :controllerType="controllerType"
                            :controllerProps="controllerProps"
                            :slots="slots"
                            v-model="modelValue[itemProps.name]"
                        />
                    </FormItem>
                </Col>
            </template>

            <Col :span="colSpan">
                <slot />
            </Col>
        </Row>
    </Form>
</template>

<script setup>
import { computed } from 'vue'
import { Form, Row, Col } from 'ant-design-vue'

const { Item: FormItem } = Form

import ControllerRender from './ControllerRender.js'

const props = defineProps({
    formProps: {
        type: Object,
        required: true
    },
    formConfig: {
        type: Array,
        required: true
    }
})

defineEmits([ 'finish' ])

const modelValue = defineModel()

const colSpan = computed(() => {
    return props.formProps?.layout === 'vertical' ? 24 : ''
})

defineOptions({ name: 'CustomForm' })
</script>

<style scoped>

</style>