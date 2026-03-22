<template>
    <a-drawer title="角色详情" :width="500" :open="open" @close="handleClose">
        <a-spin :spinning="loading">
            <!-- 基本信息卡片 -->
            <div class="info-section">
                <div class="section-title">
                    <ProfileOutlined />
                    <span>基本信息</span>
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">角色名称</span>
                        <span class="info-value" copyable>{{ roleInfo?.name }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">角色编码</span>
                        <a-typography-text class="info-value" copyable>{{ roleInfo?.code }}</a-typography-text>
                    </div>
                    <div class="info-item">
                        <span class="info-label">状态</span>
                        <a-tag :style="{ width: '40px' }" :width="10"
                            :color="roleInfo?.status === 1 ? 'green' : 'red'">{{
                                roleInfo?.status === 1 ? '启用' : '禁用'
                            }}</a-tag>
                    </div>
                    <div class="info-item">
                        <span class="info-label">描述</span>
                        <span class="info-value">{{ roleInfo?.description }}</span>
                    </div>
                </div>
            </div>

            <div class="info-section">
                <div class="section-title">
                    <ProfileOutlined />
                    <span>系统信息</span>
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">创建人</span>
                        <span class="info-value">{{ roleInfo?.createBy }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">创建时间</span>
                        <span class="info-value">{{ roleInfo?.createTime }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">更新人</span>
                        <span class="info-value">{{ roleInfo?.updateBy }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">更新时间</span>
                        <span class="info-value">{{ roleInfo?.updateTime }}</span>
                    </div>
                </div>
            </div>

            <!-- 权限列表 -->
            <a-card title="已分配权限" size="small" class="permission-card">
                <template #extra>
                    <a-space>
                        <a-button size="small" @click="handleExpandAll">展开全部</a-button>
                        <a-button size="small" @click="handleCollapseAll">收起全部</a-button>
                    </a-space>
                </template>
                <a-spin :spinning="treeLoading">
                    <a-tree v-if="permissionTree.length" v-model:expandedKeys="expandedKeys" :tree-data="permissionTree"
                        :field-names="{ children: 'children', title: 'name', key: 'id' }" :selectable="false"
                        :height="350" :checked-keys="checkedKeys" checkable>
                        <template #title="{ name, type }">
                            <span>
                                <FolderOutlined v-if="type === 1" class="mr-1 text-yellow-500" />
                                <MenuOutlined v-else-if="type === 2" class="mr-1 text-blue-500" />
                                <ApiOutlined v-else class="mr-1 text-green-500" />
                                {{ name }}
                            </span>
                        </template>
                    </a-tree>
                    <a-empty v-else description="暂无权限数据" />
                </a-spin>
            </a-card>
        </a-spin>
    </a-drawer>
</template>

<script setup lang="ts">
import { getPermissionTreeSelectApi, type PermissionVO } from '@/api/permission'
import { getRoleDetailApi, getRolePermissionIdsApi, type RoleVO } from '@/api/role'
import {
    ApiOutlined,
    FolderOutlined,
    MenuOutlined,
    ProfileOutlined
} from '@ant-design/icons-vue'
import { ref } from 'vue'

interface PermissionTreeNode extends PermissionVO {
    children?: PermissionTreeNode[]
}

const open = ref(false)
const loading = ref(false)
const roleInfo = ref<RoleVO | null>(null)
const treeLoading = ref(false)
const permissionTree = ref<PermissionTreeNode[]>([])
const checkedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])

// 收集所有节点的 key
const collectAllKeys = (nodes: PermissionTreeNode[]): string[] => {
    const keys: string[] = []
    const traverse = (list: PermissionTreeNode[]) => {
        for (const node of list) {
            keys.push(node.id)
            if (node.children?.length) {
                traverse(node.children)
            }
        }
    }
    traverse(nodes)
    return keys
}

// 展开全部
const handleExpandAll = () => {
    expandedKeys.value = collectAllKeys(permissionTree.value)
}

// 收起全部
const handleCollapseAll = () => {
    expandedKeys.value = []
}

// 加载角色详情
const loadRoleDetail = async (id: string) => {
    loading.value = true
    try {
        const res = await getRoleDetailApi(id)
        roleInfo.value = res.data
    } catch (error) {
        console.error('加载角色详情失败:', error)
    } finally {
        loading.value = false
    }
}

// 加载权限树
const loadPermissionTree = async () => {
    treeLoading.value = true
    try {
        const res = await getPermissionTreeSelectApi({ includeTypes: [1, 2, 3] })
        permissionTree.value = res.data as PermissionTreeNode[]
        // 默认展开第一层
        expandedKeys.value = permissionTree.value.map(item => item.id)
    } catch (error) {
        console.error('加载权限树失败:', error)
    } finally {
        treeLoading.value = false
    }
}

// 加载角色已有权限
const loadRolePermissions = async (roleId: string) => {
    try {
        const res = await getRolePermissionIdsApi(roleId)
        checkedKeys.value = res.data || []
    } catch (error) {
        console.error('加载角色权限失败:', error)
    }
}

// 打开详情抽屉
const show = async (id: string) => {
    open.value = true
    checkedKeys.value = []

    await Promise.all([
        loadRoleDetail(id),
        loadPermissionTree(),
        loadRolePermissions(id)
    ])
}

// 关闭抽屉
const handleClose = () => {
    open.value = false
    roleInfo.value = null
    checkedKeys.value = []
    expandedKeys.value = []
}

defineExpose({
    show
})
</script>

<style scoped>



</style>
