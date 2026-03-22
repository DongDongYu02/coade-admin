<template>
    <DetailDrawer v-model:open="openModel" title="权限详情" :data="record" :header="headerConfig" :groups="groupsConfig"
        :loading="loading">
        <template #headerIcon>
            <DynamicIcon v-if="record?.icon" :name="record.icon" />
            <FolderOutlined v-else-if="record?.type === 1" />
            <MenuOutlined v-else-if="record?.type === 2" />
            <KeyOutlined v-else />
        </template>
    </DetailDrawer>
</template>

<script setup lang="ts">
import { getPermissionDetailApi, type PermissionVO } from '@/api/permission'
import DetailDrawer, { type DetailGroup, type DetailHeader } from '@/components/DetailDrawer.vue'
import DynamicIcon from '@/components/icon/DynamicIcon.vue'
import {
    ClockCircleOutlined,
    FolderOutlined,
    InfoCircleOutlined,
    KeyOutlined,
    LinkOutlined,
    MenuOutlined,
    SettingOutlined
} from '@ant-design/icons-vue'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
    open: boolean
    data?: any | null
}>()

const emit = defineEmits<{
    (e: 'update:open', v: boolean): void
}>()
const loading = ref(false)
const record = ref<PermissionVO | null>(null)

const getPermissionDetail = async (id: string) => {
    loading.value = true
    const resp = await getPermissionDetailApi(id)
    record.value = (resp as any).data ?? (resp as any)
    loading.value = false
}

watch(
    () => [props.open, props.data?.id] as const,
    async ([open, id]) => {
        if (!open) {
            record.value = null
            return
        }
        if (id) {
            await getPermissionDetail(id)
        }
    },
    { immediate: true }
)
const openModel = computed({
    get: () => props.open,
    set: (v) => emit('update:open', v)
})

const typeMap: Record<number, { text: string; color: string }> = {
    1: { text: '目录', color: 'blue' },
    2: { text: '菜单', color: 'green' },
    3: { text: '按钮', color: 'pink' }
}

const headerConfig = computed<DetailHeader>(() => ({
    title: record.value?.name ?? '',
    subtitle: record.value?.path,
    tags: [
        typeMap[record.value?.type ?? 1] ?? { text: '未知', color: 'black' },
        {
            text: record.value?.status === 1 ? '启用' : '禁用',
            color: record.value?.status === 1 ? 'success' : 'error'
        }
    ]
}))

const groupsConfig = computed<DetailGroup[]>(() => {
    const groups: DetailGroup[] = [
        {
            title: '基本信息',
            icon: InfoCircleOutlined,
            items: [
                { field: 'name', label: '权限名称' },
                { field: 'sort', label: '排序' },
                { field: 'authCode', label: '权限标识', span: 2, type: 'code', copyable: true }
            ]
        }
    ]

    // 路由配置（按钮类型不显示）
    if (record.value?.type !== 3) {
        const routeItems = [
            { field: 'path', label: '路由地址', type: 'code' as const }
        ]
        if (record.value?.type === 2) {
            routeItems.push({ field: 'component', label: '组件路径', type: 'code' as const })
        }
        if (record.value?.type === 1) {
            routeItems.push({ field: 'redirect', label: '重定向', type: 'code' as const })
        }
        groups.push({
            title: '路由配置',
            icon: LinkOutlined,
            column: 1,
            items: routeItems
        })

        // 其他设置
        const settingItems: any[] = [
            {
                field: 'hidden',
                label: '隐藏菜单',
                type: 'tag' as const,
                tagColor: (v: number) => v === 1 ? 'orange' : 'default',
                tagText: (v: number) => v === 1 ? '是' : '否'
            }
        ]
        if (record.value?.type === 2) {
            settingItems.push(
                {
                    field: 'keepAlive',
                    label: '缓存页面',
                    type: 'tag' as const,
                    tagColor: (v: number) => v === 1 ? 'cyan' : 'default',
                    tagText: (v: number) => v === 1 ? '是' : '否'
                },
                {
                    field: 'affix',
                    label: '固定标签栏',
                    type: 'tag' as const,
                    tagColor: (v: number) => v === 1 ? 'purple' : 'default',
                    tagText: (v: number) => v === 1 ? '是' : '否'
                }
            )
        }
        groups.push({
            title: '其他设置',
            icon: SettingOutlined,
            column: record.value?.type === 2 ? 3 : 1,
            items: settingItems
        })
    }

    // 系统信息
    groups.push({
        title: '系统信息',
        icon: ClockCircleOutlined,
        size: 'small',
        items: [
            { field: 'creator', label: '创建人' },
            { field: 'createTime', label: '创建时间' },
            { field: 'updater', label: '更新人' },
            { field: 'updateTime', label: '更新时间' }
        ]
    })

    return groups
})
</script>
