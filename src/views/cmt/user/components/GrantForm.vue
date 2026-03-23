<template>
    <a-drawer title="角色授权" :width="500" :open="open" @close="handleClose">
        <!-- 基本信息卡片 -->
        <div class="info-section">
            <div class="section-title">
                <ProfileOutlined />
                <span>基本信息</span>
            </div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">姓名</span>
                    <span class="info-value">{{ userInfo?.username }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">手机号</span>
                    <a-typography-text class="info-value">{{ userInfo?.phone }}</a-typography-text>
                </div>
                <div class="info-item">
                    <span class="info-label">部门</span>
                    <span class="info-value">{{ userInfo?.dept }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">企微唯一标识</span>
                    <span class="info-value">{{ userInfo?.weComId }}</span>
                </div>
            </div>
        </div>

        <!-- 权限选择树 -->
        <a-card title="权限配置" size="small">
            <template #extra>
                <a-space>
                    <a-button size="small" @click="handleCheckAll">全选</a-button>
                    <a-button size="small" @click="handleUncheckAll">取消全选</a-button>
                </a-space>
            </template>

            <a-spin :spinning="treeLoading">
                <a-tree v-if="permissions.length" ref="treeRef" v-model:checkedKeys="checkedKeys"
                    v-model:expandedKeys="expandedKeys" :tree-data="permissions"
                    :field-names="{ title: 'text', key: 'id' }" checkable :selectable="false" :check-strictly="true"
                    :height="400">
                </a-tree>
                <a-empty v-else description="暂无权限数据" />
            </a-spin>
        </a-card>

        <template #extra>
            <a-space>
                <a-button @click="handleClose">取消</a-button>
                <a-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</a-button>
            </a-space>
        </template>
    </a-drawer>
</template>

<script setup lang="ts">
import { getPermissionSelectionApi } from '@/api/cmt/cmt-permission'
import { getUserPermissionsApi, grantPermissions, type CmtUserVO } from '@/api/cmt/cmt-user'
import { ProfileOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { ref } from 'vue'

const emit = defineEmits<{
    (e: 'success'): void
}>()

const open = ref(false)
const userInfo = ref<CmtUserVO | null>(null)
const treeLoading = ref(false)
const submitLoading = ref(false)
const permissions = ref<{ id: string; text: string }[]>([])
const checkedKeys = ref<{ checked: string[], halfChecked: string[] }>({ checked: [], halfChecked: [] })
const expandedKeys = ref<string[]>([])

// 收集所有节点的 key
const collectAllKeys = (nodes: { id: string; text: string }[]): string[] => {
    const keys: string[] = []
    nodes.forEach(item => {
        keys.push(item.id)
    })
    return keys
}


// 全选
const handleCheckAll = () => {
    checkedKeys.value = { checked: collectAllKeys(permissions.value), halfChecked: [] }
}

// 取消全选
const handleUncheckAll = () => {
    checkedKeys.value = { checked: [], halfChecked: [] }
}

// 加载权限树
const loadPermissions = async () => {
    treeLoading.value = true
    try {
        const res = await getPermissionSelectionApi()
        permissions.value = res.data
    } catch (error) {
        console.error('加载权限树失败:', error)
    } finally {
        treeLoading.value = false
    }
}

// 加载用户已有权限
const loadUserPermissions = async (userId: string) => {
    try {
        const res = await getUserPermissionsApi(userId)
        const checked = res.data.map(item => {
            return item.id!!
        })
        checkedKeys.value = { checked: checked || [], halfChecked: [] }
    } catch (error) {
        console.error('加载角色权限失败:', error)
    }
}

// 打开授权抽屉
const show = async (user: CmtUserVO) => {
    console.log(user);

    userInfo.value = user
    open.value = true
    checkedKeys.value = { checked: [], halfChecked: [] }

    await loadPermissions()
    await loadUserPermissions(user.id)
}

// 关闭抽屉
const handleClose = () => {
    open.value = false
    userInfo.value = null
    checkedKeys.value = { checked: [], halfChecked: [] }
    expandedKeys.value = []
}

// 提交授权
const handleSubmit = async () => {
    if (!userInfo.value) return

    submitLoading.value = true
    try {
        // checkStrictly 模式下直接使用 checked 数组
        const allCheckedKeys = checkedKeys.value.checked
        await grantPermissions(userInfo.value.id, { permissions: allCheckedKeys })
        message.success('授权成功')
        emit('success')
        handleClose()
    } catch (error) {
        console.error('授权失败:', error)
    } finally {
        submitLoading.value = false
    }
}

defineExpose({
    show
})
</script>

<style scoped>
.role-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    border-radius: 12px;
    margin-bottom: 12px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.icon-wrapper {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-icon {
    font-size: 28px;
    color: #1890ff;
}

.header-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.header-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}

.header-subtitle {
    font-size: 13px;
    color: #6b7280;
    font-family: monospace;
}

.header-right {
    display: flex;
    gap: 8px;
}

.role-description {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 16px;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.5;
}

.desc-icon {
    color: #9ca3af;
    margin-top: 2px;
    flex-shrink: 0;
}
</style>
