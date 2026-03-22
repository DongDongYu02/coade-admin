<template>
    <div class="bg-white px-2 pb-2 h-full flex flex-col min-h-0">
        <div class="table-container flex-1 min-h-0 flex flex-col">
            <div class="table-body flex-1 min-h-0">
                <vxe-grid ref="gridRef" v-bind="gridOptions" :data="rows" :loading="loading" :style="cssVars"
                    @checkbox-change="onCheckboxChange" @checkbox-all="onCheckboxAll">
                    <!-- 工具栏左侧插槽 -->
                    <template #buttons>
                        <slot name="toolbar-left" />
                    </template>

                    <!-- 工具栏右侧插槽（带参数） -->
                    <template #tools>
                        <slot name="toolbar-right" :hasSelection="hasSelection" :selectedRecords="selectedRecords"
                            :reload="reload" :getSelectedRecords="getSelectedRecords" :grid="gridRef" />
                    </template>

                    <!-- 操作列插槽 -->
                    <template #action="{ row }">
                        <div class="action-buttons">
                            <slot name="action" :row="row" :reload="reload" />
                        </div>
                    </template>

                    <!-- 动态透传其他插槽给 vxe-grid（如自定义单元格插槽） -->
                    <template v-for="name in customSlotNames" :key="name" #[name]="scope">
                        <slot :name="name" v-bind="scope" />
                    </template>

                </vxe-grid>
            </div>

            <div v-if="showPager" class="pager shrink-0 pt-3">
                <vxe-pager v-model:pageNo="page.pageNo" v-model:pageSize="page.pageSize" :total="page.total"
                    :size="pagerSize" :background="pagerBackground" :layouts="pagerLayouts"
                    @page-change="onPageChange" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, useSlots, watch } from 'vue'
import type { PropType } from 'vue'
import type { VxeGridInstance, VxeGridProps, VxeTableEvents } from 'vxe-table'

export type PageQuery = { pageNo: number; pageSize: number }
type PageResult<T = any> = { total: number; result: T[] }
type RequestFn<T = any> = (query: PageQuery) => Promise<PageResult<T>>

const props = defineProps({
    /** 列配置（直接传 vxe 的 columns） */
    columns: { type: Array as PropType<VxeGridProps['columns']>, required: true },

    /** 拉取数据函数：({pageNo,pageSize}) => Promise<{total,result}> */
    request: { type: Function as PropType<RequestFn>, required: true },

    /** 额外 grid 配置（会 merge 进默认配置） */
    gridProps: { type: Object as PropType<Partial<VxeGridProps>>, default: () => ({}) },

    /** 表格边框变量 */
    borderColor: { type: String, default: '#E4E4E7' },
    borderWidth: { type: String, default: '1px' },

    /** 分页 */
    showPager: { type: Boolean, default: true },
    pagerSize: { type: String as PropType<'mini' | 'small' | 'medium'>, default: 'mini' },
    pagerBackground: { type: Boolean, default: true },
    pagerLayouts: {
        type: Array as PropType<any[]>,
        default: () => ['Total', 'Sizes', 'Home', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'End']
    },

    /** 受控分页（可选） */
    pageNo: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 },

    /** 操作列 */
    showActionColumn: { type: Boolean, default: false },
    actionColumnProps: {
        type: Object as PropType<{
            title?: string
            width?: number | string
            fixed?: 'left' | 'right'
            align?: 'left' | 'center' | 'right'
        }>,
        default: () => ({})
    }
})

const emit = defineEmits<{
    (e: 'update:pageNo', v: number): void
    (e: 'update:pageSize', v: number): void
    (e: 'loaded', payload: { total: number; rows: any[] }): void
    (e: 'selection-change', payload: { records: any[]; hasSelection: boolean }): void
}>()

/** refs & data */
const gridRef = ref<VxeGridInstance>()
const loading = ref(false)
const rows = ref<any[]>([])
const slots = useSlots()

/** 保留插槽名（不透传给 vxe-grid） */
const reservedSlots = ['toolbar-left', 'toolbar-right', 'action', 'default']
const customSlotNames = computed(() =>
    Object.keys(slots).filter(name => !reservedSlots.includes(name))
)

const page = reactive({
    total: 0,
    pageNo: props.pageNo,
    pageSize: props.pageSize
})

watch(
    () => props.pageNo,
    (v) => (page.pageNo = v)
)
watch(
    () => props.pageSize,
    (v) => (page.pageSize = v)
)

/** 选中态 */
const selectedRecords = ref<any[]>([])
const hasSelection = computed(() => selectedRecords.value.length > 0)

const onCheckboxChange: VxeTableEvents.CheckboxChange = (params) => {
    selectedRecords.value = params.records || []
    emit('selection-change', { records: selectedRecords.value, hasSelection: hasSelection.value })
}
const onCheckboxAll: VxeTableEvents.CheckboxAll = (params) => {
    selectedRecords.value = params.records || []
    emit('selection-change', { records: selectedRecords.value, hasSelection: hasSelection.value })
}

const getSelectedRecords = () => gridRef.value?.getCheckboxRecords() ?? []


/** 操作列配置 */
const actionColumn = computed(() => {
    if (!props.showActionColumn) return null
    const { title, width, fixed, align } = props.actionColumnProps
    return {
        field: 'action',
        title: title ?? '操作',
        width: width ?? 120,
        fixed: fixed ?? 'right',
        align: align ?? 'center',
        resizable: false,
        slots: { default: 'action' }
    }
})

/** 合并后的列配置 */
const mergedColumns = computed(() => {
    const cols = [...(props.columns || [])]
    if (actionColumn.value) {
        cols.push(actionColumn.value)
    }
    return cols
})

/** 默认 grid 配置 + 外部覆盖 */
const gridOptions = computed<VxeGridProps>(() => {
    const base: VxeGridProps = {
        showOverflow: true,
        stripe: true,
        size: 'small',
        round: true,
        autoResize: true,
        height: '100%',
        rowConfig: {
            keyField: 'id',
            isHover: true
        },
        columnConfig: { resizable: true },
        customConfig: { immediate: true },
        toolbarConfig: {
            refreshOptions: { queryMethod: reload },
            custom: true,
            refresh: true,
            slots: {
                buttons: 'buttons',
                tools: 'tools'
            }
        },
        columns: mergedColumns.value
    }

    // 外部覆盖
    return Object.assign(base, props.gridProps, { columns: mergedColumns.value })
})

const cssVars = computed(() => ({
    '--vxe-ui-table-border-color': props.borderColor,
    '--vxe-ui-table-border-width': props.borderWidth
}))

/** 请求数据 */
const reload = async () => {
    loading.value = true
    try {
        const data = await props.request({ pageNo: page.pageNo, pageSize: page.pageSize })
        rows.value = data.result
        page.total = data.total
        emit('loaded', { total: data.total, rows: data.result })
    } finally {
        loading.value = false
    }
}

const onPageChange = ({ currentPage, pageSize }: { currentPage: number; pageSize: number }) => {
    page.pageNo = currentPage
    page.pageSize = pageSize
    emit('update:pageNo', currentPage)
    emit('update:pageSize', pageSize)
    reload()
}

defineExpose({
    reload,
    getSelectedRecords,
    gridRef
})

reload()
</script>

<style scoped>
.table-container {
    overflow: hidden;
    width: 100%;
}

/* 你原来的 pager 布局 */
:deep(.vxe-pager--wrapper) {
    display: flex;
    align-items: center;
}

:deep(.vxe-pager--sizes) {
    margin-right: auto;
}

/* 操作列按钮样式 */
.action-buttons {
    display: inline-flex;
    align-items: center;
    gap: 16px;
}

.action-buttons > :deep(*:not(:last-child)) {
    position: relative;
}

.action-buttons > :deep(*:not(:last-child)::after) {
    content: '';
    position: absolute;
    right: -8.5px;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 14px;
    background-color: #d9d9d9;
}
</style>
