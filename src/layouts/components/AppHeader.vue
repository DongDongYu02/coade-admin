<template>
  <a-layout-header class="app-header">
    <div class="ml-3 h-full flex items-center gap-2 text-[14px]">
      <!-- 折叠按钮 -->
      <menu-unfold-outlined v-if="collapsed" class="icon-btn" @click="toggleCollapsed" />
      <menu-fold-outlined v-else class="icon-btn" @click="toggleCollapsed" />

      <!-- 刷新按钮 -->
      <reload-outlined class="icon-btn" @click="emitRefresh" />

      <!-- 面包屑 -->
      <transition name="bc" mode="out-in">
        <a-breadcrumb class="ml-2" :key="breadcrumbKey">
          <template #separator>
            <right-outlined v-if="breadcrumbs.length > 1" style="font-size: 10px;" />
            <span v-else></span>
          </template>
          <a-breadcrumb-item v-for="(item, idx) in breadcrumbs" :key="idx">
            <span v-if="item.icon" class="breadcrumb-icon-wrapper">
              <component :is="resolveIcon(item.icon)" class="breadcrumb-icon" />
            </span>
            {{ item.title }}
          </a-breadcrumb-item>
        </a-breadcrumb>
      </transition>

      <div class="ml-auto pr-1">
        <a-dropdown v-model:open="userMenuOpen" :trigger="['hover']" placement="bottomRight"
          overlayClassName="user-dropdown-overlay">
          <a-avatar class="user-avatar" :size="40" :src="userAvatar">
            <template #icon v-if="!authStore.avatar">
              <UserOutlined />
            </template>
          </a-avatar>
          <template #overlay>
            <div class="user-pop" @click.stop>
              <!-- 顶部用户信息 -->
              <div class="user-head">
                <a-image v-if="authStore.avatar" :src="userAvatar" :width="36" :height="36"
                  style="border-radius: 50%; object-fit: contain; cursor: pointer;" :preview="{ mask: true }" />
                <a-avatar :size="40" v-if="!authStore.avatar">
                  <template #icon>
                    <UserOutlined />
                  </template>
                </a-avatar>
                <div class="user-info">
                  <div class="user-name">
                    {{ userNickname }}
                  </div>
                </div>
              </div>

              <a-divider style="margin: 10px 0;" />

              <!-- 菜单项 -->
              <div class="user-item" @click="onMenuClick('profile')">
                <UserOutlined class="user-item-icon" />
                <span>个人中心</span>
              </div>

              <a-divider style="margin: 10px 0;" />

              <div class="user-item" @click="onMenuClick('resetPassword')">
                <LockOutlined class="user-item-icon" />
                <span>修改密码</span>
              </div>

              <div class="user-item danger" @click="onMenuClick('logout')">
                <LogoutOutlined class="user-item-icon" />
                <span>退出登录</span>
              </div>
            </div>
          </template>
        </a-dropdown>
      </div>
    </div>
  </a-layout-header>
  <!-- 退出确认弹窗 -->
  <a-modal v-model:open="logoutComfirmModalVisible" title="提示" @ok="onConfirmLogoutClick"
    @cancel="logoutComfirmModalVisible = false" ok-text="确定" cancel-text="取消">
    <p>您确定要退出登录吗？</p>
  </a-modal>

  <!-- 修改密码弹窗 -->
  <a-modal v-model:open="passwordModalVisible" title="修改密码" :confirm-loading="passwordLoading"
    @ok="onConfirmChangePassword" @cancel="onCancelChangePassword" ok-text="确定" cancel-text="取消">
    <a-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" :label-col="{ span: 4 }">
      <a-form-item label="旧密码" name="oldPassword">
        <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入原密码" />
      </a-form-item>
      <a-form-item label="新密码" name="newPassword">
        <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
      </a-form-item>
      <a-form-item label="确认密码" name="confirmPassword">
        <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import logo from '@/assets/nexus-logo.png';
import {
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReloadOutlined,
  RightOutlined,
  UserOutlined
} from '@ant-design/icons-vue';
import { message, type FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { computed, reactive, ref } from 'vue';

import { changePasswordApi, logoutApi } from '@/api/auth';
import router from "@/router";
import { resolveIcon, type BreadcrumbItem } from '@/router/dynamic';
import { useAuthStore } from "@/stores/auth";
const FILE_ACCESS_URL = window.location.origin + import.meta.env.VITE_FILE_ACCESS_PATH_PREFIX
const authStore = useAuthStore()

// 用户信息
const userNickname = computed(() => authStore.nickname || '用户')
const userAvatar = computed(() => {
  const avatar = authStore.avatar
  return avatar ? FILE_ACCESS_URL + avatar : logo
})

const breadcrumbKey = computed(() => props.breadcrumbs.map(b => b.title).join(' / '))
const props = defineProps<{
  collapsed: boolean
  breadcrumbs: BreadcrumbItem[]
}>()

const emit = defineEmits<{
  (e: 'update:collapsed', v: boolean): void
  (e: 'refresh'): void
}>()

const toggleCollapsed = () => {
  emit('update:collapsed', !props.collapsed)
}

const emitRefresh = () => {
  emit('refresh')
}

const userMenuOpen = ref(false)

const onMenuClick = (key: string) => {
  userMenuOpen.value = false

  switch (key) {
    case 'profile':
      console.log('跳转：个人中心')
      break
    case 'resetPassword':
      openPasswordModal()
      break
    case 'logout':
      onLogoutClick()
      break
  }
}

// ========== 修改密码 ==========
const passwordModalVisible = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = async (_rule: Rule, value: string) => {
  if (value && value !== passwordForm.newPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

const passwordRules: Record<string, Rule[]> = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const openPasswordModal = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordModalVisible.value = true
}

const onCancelChangePassword = () => {
  passwordFormRef.value?.resetFields()
  passwordModalVisible.value = false
}

const onConfirmChangePassword = async () => {
  try {
    await passwordFormRef.value?.validate()
    passwordLoading.value = true
    await changePasswordApi({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    message.success('密码修改成功，请重新登录')
    passwordModalVisible.value = false
    // 修改成功后退出登录
    useAuthStore().clearToken()
    router.push('/login')
  } catch (error: any) {
    // 表单验证失败不提示
    if (error?.errorFields) return
  } finally {
    passwordLoading.value = false
  }
}

// ========== 退出登录 ==========
const logoutComfirmModalVisible = ref(false)

const onLogoutClick = () => {
  logoutComfirmModalVisible.value = true
}

const onConfirmLogoutClick = () => {
  useAuthStore().clearToken();
  logoutApi();
  router.push(`/login`);
}
</script>

<style scoped>
.app-header {
  background: #fff;
  padding: 0;
  height: 50px;
  border-bottom: 1px solid #f0f0f0;
}

.icon-btn {
  cursor: pointer;
  border-radius: 6px;
  padding: 8px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #1677ff;
}

.icon-btn:active {
  transform: scale(0.95);
}

:deep(.ant-breadcrumb-separator) {
  display: inline-flex !important;
  align-items: center !important;
  height: 100%;
  position: relative;
  top: -1px;
  justify-content: center !important;
}

/* ✅ TransitionGroup 必须有一个容器保持 inline */
.bc-group {
  display: inline-flex;
  align-items: center;
}

/* 进入/离开动画 */
.bc-enter-active,
.bc-leave-active {
  transition: all 0.22s ease;
}

/* 进入起点 */
.bc-enter-from {
  opacity: 0;
  transform: translateX(6px);
}

/* 离开终点 */
.bc-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}

:deep(.ant-avatar >img) {
  object-fit: contain !important;
  padding: 2px;
  background: #f5f5f5;
  border-radius: 50%;
}

:deep(.ant-avatar) {
  transition: all 0.2s ease;
  background: #f5f5f5;
  /* 添加平滑过渡效果 */
}

:deep(.ant-avatar:hover) {
  border: 1px solid #1677ff;
  /* 添加蓝色边框 */
  box-shadow: 0 0 1px rgba(22, 119, 255, 0.5);
  /* 添加阴影效果 */
  cursor: pointer;
}


/* 头像 hover 选中效果 */
.user-avatar {
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-avatar:hover {
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.2);
}

/* 弹窗容器 */
.user-pop {
  width: 180px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* 顶部信息 */
.user-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.user-email {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

/* 菜单项 */
.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.user-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.user-item-icon {
  font-size: 15px;
  color: #333;
}

.shortcut {
  margin-left: auto;
  font-size: 12px;
  color: #bfbfbf;
}

.user-item.danger:hover {
  background: rgba(255, 77, 79, 0.08);
}

:deep(.ant-breadcrumb-link) {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.breadcrumb-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.breadcrumb-icon {
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>