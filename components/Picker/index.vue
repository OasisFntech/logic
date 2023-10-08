<template>
    <div class="picker">
        <div
            v-for="(o, i) in options"
            :key="i"
            :class="[ modelValue === o[valueKey] || index === i ? 'active' : 'inactive' ]"
            class="picker-item"
            @click="onClick(o[valueKey], i)"
        >
            {{ showRender ? showRender(o[showKey], o) : o[showKey] }}
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    options: {
        type: Array,
        required: true,
    },
    showKey: {
        type: String,
        default: 'label',
    },
    showRender: Function,
    valueKey: {
        type: String,
        default: 'value',
    },
    index: Number,
})

const modelValue = defineModel()

const emits = defineEmits([ 'click', 'change', 'update:index' ])

const onClick = (selected, i) => {
    if (modelValue.value !== selected) {
        modelValue.value = selected
        
        if (props.index !== undefined && i !== props.index) {
            emits('update:index', i)
            emits('change', selected, i)
        }
    }
    
    emits('click', selected, i)
}

defineOptions({ name: 'Picker' })
</script>

<style scoped>
.picker {
    @apply grid grid-cols-4 gap-2.5;
}

.picker-item {
    @apply rounded h-8 leading-8 text-center text-sm cursor-pointer;
}

.picker-item.active {
    @apply bg-primary text-white;
}

.picker-item:active {
    @apply opacity-80;
}

.picker-item.inactive {
    @apply bg-grey;
}
</style>
