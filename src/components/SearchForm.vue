<template>
    <div class="bg-white p-4 rounded-sm">
        <a-form ref="formRef" class="search-form" :model="innerModel" :layout="layout" :colon="colon"
            :label-align="labelAlign" :label-col="mergedLabelCol" :wrapper-col="mergedWrapperCol">
            <div class="search-fields">
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
                    <div class="actions">
                        <slot name="extraActions" :model="innerModel" />

                        <a-button @click="onReset">重置</a-button>
                        <a-button type="primary" :loading="loading" @click="onSearch">搜索</a-button>

                        <a v-if="showToggle" class="toggle" @click="toggleExpand">
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
import { Grid, type FormInstance } from 'ant-design-vue'
import { computed, reactive, ref, watch } from 'vue'

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

/** v-model 动态参数：默认 value */
const resolveModelProp = (item: SearchFieldItem) => item.modelProp || 'value'

const innerModel = reactive<Record<string, any>>({ ...props.modelValue })

watch(
    () => props.modelValue,
    (v) => Object.assign(innerModel, v),
    { deep: true }
)

watch(
    innerModel,
    () => emit('update:modelValue', { ...innerModel }),
    { deep: true }
)

const screens = Grid.useBreakpoint()

/** 基础列数：lg=3, md=2, sm/xs=1 */
const baseCols = computed(() => {
    if (screens.value.lg) return 3
    if (screens.value.md) return 2
    return 1
})

const expanded = ref(props.defaultExpanded)




/** 收起：只显示“第一行能放下的字段数”（用 baseCols，而不是 layoutCols） */
const displayItems = computed(() => {
    if (expanded.value) return props.items
    return props.items.slice(0, baseCols.value)
})

/** 是否显示 展开/收起 */
const showToggle = computed(() => props.items.length > baseCols.value)



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
    min-width: 350px;
    max-width: 350px;
}

.search-field-item :deep(.ant-form-item-control-input-content) {
    width: 160px;
}

.action-item {
    flex: 1 1 auto;
    min-width: fit-content;
}

.action-item :deep(.ant-form-item-control-input) {
    min-height: 32px;
}

.actions {
    display: flex;
    justify-content: flex-end;
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
