<template>
    <a-form
        v-bind="formProps"
        layout="vertical"
        @finish="$emit('finish', $event)"
    >
        <a-row :gutter="[ 16 ]">
            <template v-for="({ itemProps, controllerType, controllerProps, slots }) in formConfig" :key="itemProps.name">
                <a-col :span="colSpan">
                    <a-form-item v-bind="itemProps">
                        <ControllerRender
                            :controllerType="controllerType"
                            :controllerProps="controllerProps"
                            :slots="slots"
                            v-model="modelValue[itemProps.name]"
                        />
                    </a-form-item>
                </a-col>
            </template>

            <a-col :span="colSpan">
                <slot />
            </a-col>
        </a-row>
    </a-form>
</template>

<script setup>
import { computed } from 'vue'

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