<template>
    <a-drawer title="用户详情" :width="500" :open="open" @close="handleClose">
        <a-spin :spinning="loading">
            <!-- 基本信息卡片 -->
            <div class="info-section">
                <div class="section-title">
                    <ProfileOutlined />
                    <span>基本信息</span>
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">用户名</span>
                        <span class="info-value">{{ userInfo?.username }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">头像</span>
                        <a-image v-if="userInfo?.avatar" :src="FILE_ACCESS_URL + userInfo.avatar" :width="40"
                            :height="40" style="border-radius: 50%; object-fit: contain; cursor: pointer;"
                            :preview="{ mask: true }" />
                    </div>
                    <div class="info-item">
                        <span class="info-label">昵称</span>
                        <span class="info-value">{{ userInfo?.nickname }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">手机号</span>
                        <span class="info-value">{{ userInfo?.phone }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">角色</span>
                        <div class="flex">
                            <a-tag  v-for="role in userInfo?.roleNames" :key="role"
                                color="pink">{{ role }}</a-tag>
                        </div>

                    </div>
                    <div class="info-item">
                        <span class="info-label">状态</span>
                        <a-tag :style="{ width: '40px' }" :width="10"
                            :color="userInfo?.status === 1 ? 'green' : 'red'">{{
                                userInfo?.status === 1 ? '启用' : '禁用'
                            }}</a-tag>
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
                        <span class="info-value">{{ userInfo?.creator }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">创建时间</span>
                        <span class="info-value">{{ userInfo?.createTime }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">更新人</span>
                        <span class="info-value">{{ userInfo?.updater }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">更新时间</span>
                        <span class="info-value">{{ userInfo?.updateTime }}</span>
                    </div>
                </div>
            </div>
        </a-spin>
    </a-drawer>
</template>

<script setup lang="ts">
import { getUserDetailApi, type UserVO } from '@/api/user'
import { FILE_ACCESS_URL } from '@/config/global'
import {
    ProfileOutlined
} from '@ant-design/icons-vue'
import { ref } from 'vue'

const open = ref(false)
const loading = ref(false)
const userInfo = ref<UserVO | null>(null)

// 加载用户详情
const loadUserDetail = async (id: string) => {
    loading.value = true
    try {
        const res = await getUserDetailApi(id)
        userInfo.value = res.data
    } catch (error) {
        console.error('加载用户详情失败:', error)
    } finally {
        loading.value = false
    }
}

// 打开详情抽屉
const show = async (id: string) => {
    open.value = true

    loadUserDetail(id)
}

// 关闭抽屉
const handleClose = () => {
    open.value = false
    userInfo.value = null
}

defineExpose({
    show
})
</script>

<style scoped></style>
