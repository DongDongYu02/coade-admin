<template>
    <div class="bg-white p-4 rounded-sm">
        <a-form ref="formRef" class="search-form" :model="innerModel" :layout="layout" :colon="colon"
            :label-align="labelAlign" :label-col="mergedLabelCol" :wrapper-col="mergedWrapperCol" @keyup.enter="onSearch">
            <div ref="searchFieldsRef" class="search-fields" :style="searchFieldsStyle">
                <!-- 字段区 -->
                <template v-for="item in displayItems" :key="item.field">
                    <a-form-item :label="item.label" :name="item.field" class="search-field-item" v-bind="item.formItemProps">
                        <slot :name="`field-${item.field}`" :model="innerModel" :item="item">
                            <component :is="item.component" v-bind="item.componentProps"
                                v-model:[resolveModelProp(item)]="innerModel[item.field]" />
                        </slot>
                    </a-form-item>
                </template>

                <!-- 操作区 -->
                <a-form-item class="action-item">
                    <div ref="actionsRef" class="actions">
                        <slot name="extraActions" :model="innerModel" />

                        <a-button @click="onReset">重置</a-button>
                        <a-button type="primary" :loading="loading" @click="onSearch">查询</a-button>

                        <a v-if="showToggle" ref="toggleRef" class="toggle" @click="toggleExpand">
                            {{ expanded ? '收起' : '展开' }}
                            <component :is="expanded ? UpOutlined : DownOutlined" />
                        </a>
                    </div>
                </a-form-item>
            </div>
        </a-form>
    </div>
</template>

<script setup lang="ts">
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

export interface SearchFieldItem {
    label: string
    field: string
    component: any
    /** v-model 的 prop 名：默认 value；Switch/Checkbox 用 checked */
    modelProp?: string
    componentProps?: Record<string, any>
    formItemProps?: Record<string, any>
}

interface Props {
    modelValue: Record<string, any>
    items: SearchFieldItem[]
    loading?: boolean
    /** 默认是否展开 */
    defaultExpanded?: boolean

    layout?: 'horizontal' | 'vertical' | 'inline'
    colon?: boolean
    labelAlign?: 'left' | 'right'
    labelWidth?: number
    /** 单个筛选项宽度，不传时保持默认宽度 */
    fieldWidth?: number

    gutter?: [number, number]
}
const formRef = ref<FormInstance>()

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    defaultExpanded: false,
    layout: 'horizontal',
    colon: false,
    labelAlign: 'right',
    gutter: () => [24, 12],
})

const emit = defineEmits<{
    (e: 'update:modelValue', v: Record<string, any>): void
    (e: 'search', v: Record<string, any>): void
    (e: 'reset', v: Record<string, any>): void
}>()

const SEARCH_FIELD_WIDTH = 350
const SEARCH_FIELD_GAP = 24
const ACTION_GAP = 8
const DEFAULT_ACTION_WIDTH = 160
const DEFAULT_TOGGLE_WIDTH = 44

/** v-model 动态参数：默认 value */
const resolveModelProp = (item: SearchFieldItem) => item.modelProp || 'value'

const mergedFieldWidth = computed(() => props.fieldWidth || SEARCH_FIELD_WIDTH)

const searchFieldsStyle = computed(() => ({
    '--search-field-width': `${mergedFieldWidth.value}px`,
    '--search-field-control-width': props.fieldWidth ? '100%' : '160px',
}))

const innerModel = reactive<Record<string, any>>({ ...props.modelValue })

watch(
    () => props.modelValue,
    (v) => {
        Object.keys(innerModel).forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(v, key)) {
                delete innerModel[key]
            }
        })
        Object.assign(innerModel, v)
    },
    { deep: true }
)

watch(
    innerModel,
    () => emit('update:modelValue', { ...innerModel }),
    { deep: true }
)

const expanded = ref(props.defaultExpanded)
const collapsedCount = ref(props.items.length)
const searchFieldsRef = ref<HTMLDivElement>()
const actionsRef = ref<HTMLDivElement>()
const toggleRef = ref<HTMLElement>()
let resizeObserver: ResizeObserver | null = null
const handleWindowResize = () => {
    updateCollapsedCount()
}

const getToggleReservedWidth = () => {
    const toggleWidth = toggleRef.value?.offsetWidth || DEFAULT_TOGGLE_WIDTH
    return toggleWidth + ACTION_GAP
}

const getBaseActionWidth = () => {
    const actionsWidth = actionsRef.value?.offsetWidth || DEFAULT_ACTION_WIDTH
    const toggleWidth = toggleRef.value?.offsetWidth || 0
    return toggleWidth > 0 ? Math.max(actionsWidth - toggleWidth - ACTION_GAP, DEFAULT_ACTION_WIDTH) : actionsWidth
}

const calculateCollapsedCount = (actionWidth: number) => {
    const containerWidth = searchFieldsRef.value?.clientWidth || 0
    if (!containerWidth) return props.items.length

    let availableWidth = containerWidth - actionWidth
    let count = 0

    while (count < props.items.length) {
        const requiredWidth = mergedFieldWidth.value + (count > 0 ? SEARCH_FIELD_GAP : 0)
        if (availableWidth < requiredWidth) break

        availableWidth -= requiredWidth
        count += 1
    }

    return Math.max(count, 1)
}

const updateCollapsedCount = () => {
    const baseActionWidth = getBaseActionWidth()
    const visibleCountWithoutToggle = calculateCollapsedCount(baseActionWidth)

    if (props.items.length <= visibleCountWithoutToggle) {
        collapsedCount.value = props.items.length
        return
    }

    collapsedCount.value = calculateCollapsedCount(baseActionWidth + getToggleReservedWidth())
}

/** 收起：只显示“第一行能放下的字段数” */
const displayItems = computed(() => {
    if (expanded.value || !showToggle.value) return props.items
    return props.items.slice(0, collapsedCount.value)
})

/** 是否显示 展开/收起 */
const showToggle = computed(() => props.items.length > collapsedCount.value)

const mergedLabelCol = computed(() => ({
    style: { width: `${props.labelWidth}px` },
}))

const mergedWrapperCol = computed(() => ({
    style: { flex: 1 },
}))

const onSearch = () => emit('search', { ...innerModel })

const onReset = () => {
    formRef.value?.resetFields()
    Object.keys(innerModel).forEach((k) => (innerModel[k] = undefined))
    emit('reset', { ...innerModel })
}

const toggleExpand = () => (expanded.value = !expanded.value)

watch(
    () => props.items.length,
    async () => {
        await nextTick()
        updateCollapsedCount()
    },
    { immediate: true }
)

watch(
    showToggle,
    async () => {
        await nextTick()
        updateCollapsedCount()
    }
)

onMounted(async () => {
    await nextTick()
    updateCollapsedCount()

    if (typeof ResizeObserver === 'undefined' || !searchFieldsRef.value) return

    resizeObserver = new ResizeObserver(() => {
        updateCollapsedCount()
    })

    resizeObserver.observe(searchFieldsRef.value)
    window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    window.removeEventListener('resize', handleWindowResize)
})
</script>

<style scoped>
.search-form :deep(.ant-form-item) {
    margin-bottom: 0;
}

.search-fields {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px 24px;
}

.search-field-item {
    flex: 0 0 auto;
    min-width: var(--search-field-width);
    max-width: var(--search-field-width);
}

.search-field-item :deep(.ant-form-item-control-input-content) {
    width: var(--search-field-control-width);
}

.action-item {
    flex: 0 0 auto;
    margin-left: auto;
    min-width: fit-content;
}

.action-item :deep(.ant-form-item-control-input) {
    min-height: 32px;
}

.actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
}

.toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    user-select: none;
    white-space: nowrap;
}
</style>
