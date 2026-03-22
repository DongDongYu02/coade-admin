<template>
  <a-layout class="nexus-shell" :class="{ maximized: isMaximized }" style="height: 100vh">
    <!-- Sider -->
    <SideMenu v-model:collapsed="collapsed" v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" :logo="logo"
      :title="title" :menu-items="menuItems" @menuClick="onMenuClick" />
    <!-- Main -->
    <a-layout>
      <AppHeader v-model:collapsed="collapsed" :breadcrumbs="breadcrumbs" @refresh="refreshRoute" />
      <TagsView />
      <AppContent :cachedViews="cachedViews" :maximized="isMaximized" />
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import AppContent from '@/layouts/components/AppContent.vue'
import AppHeader from '@/layouts/components/AppHeader.vue'
import SideMenu from '@/layouts/components/SideMenu.vue'
import TagsView from '@/layouts/components/TagsView.vue'
import { useAppStore } from '@/stores/app'
import { useTagsViewStore } from '@/stores/tagsView'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FILE_ACCESS_URL ,DEFAULT_LOGO, DEFAULT_SYSTEM_NAME } from '@/config/global'

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

const tagsViewStore = useTagsViewStore()
const cachedViews = computed(() => tagsViewStore.cachedViews)
const logo = computed(() => appStore.systemLogo !== '' ? FILE_ACCESS_URL + appStore.systemLogo : DEFAULT_LOGO)
const title = computed(() => appStore.systemName !== '' ? appStore.systemName : DEFAULT_SYSTEM_NAME)

const isMaximized = computed(() => appStore.maximized)
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    appStore.exitMaximize()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const collapsed = ref(false)

import { buildBreadcrumbs, buildMenuItemsFromMenus } from '@/router/dynamic'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const menuItems = computed(() => {
  const dynamic = buildMenuItemsFromMenus(authStore.menus)
  return [...(dynamic ?? [])]
})

const selectedKeys = ref<string[]>([route.path])
const openKeys = ref<string[]>([])

watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
    const parent = getParentKey(path)
    // 只添加当前路由的父级，不替换整个数组，保持其他菜单的展开状态
    if (parent && !openKeys.value.includes(parent)) {
      openKeys.value = [...openKeys.value, parent]
    }
  },
  { immediate: true }
)

function onMenuClick(key: string) {
  router.push(key)
}
function getParentKey(path: string) {
  const parts = path.split('/').filter(Boolean)
  if (parts.length >= 2) return `/${parts[0]}`
  return ''
}

const breadcrumbs = computed(() => {
  return buildBreadcrumbs(authStore.menus, route.path)
})

const refreshRoute = async () => {
  tagsViewStore.delCachedView(route)

  const { path, query } = route
  await nextTick()

  router.replace({
    path: '/redirect' + path,
    query
  })
}
</script>


<style scoped>
.nexus-shell {

  overflow: hidden;
}

.logo {
  height: 32px;
  margin: 16px;
  display: flex;
  align-items: center;
  padding-left: 12px;
  color: #fff;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
}

.header {
  background: #fff;
  padding: 0;
}

.content {
  padding: 24px;
  background: #fff;
  min-height: 360px;
  border-radius: 8px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.30s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.nexus-shell {
  --ani: 280ms;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}

.nexus-shell :deep(.ant-layout-sider) {
  transition:
    width var(--ani) var(--ease),
    flex-basis var(--ani) var(--ease),
    max-width var(--ani) var(--ease),
    min-width var(--ani) var(--ease),
    opacity var(--ani) var(--ease),
    transform var(--ani) var(--ease);
  transform-origin: left top;
}

.nexus-shell.maximized :deep(.ant-layout-sider) {
  width: 0 !important;
  max-width: 0 !important;
  min-width: 0 !important;
  flex: 0 0 0 !important;

  opacity: 0;
  transform: translateX(-12px) scale(0.96);
  pointer-events: none;
  overflow: hidden;
}

/* ✅ 2) Header（缩小 + 淡出 + 高度收起） */
.nexus-shell :deep(.ant-layout-header) {
  overflow: hidden;
  transition:
    height var(--ani) var(--ease),
    padding var(--ani) var(--ease),
    opacity var(--ani) var(--ease),
    transform var(--ani) var(--ease);
  transform-origin: top center;
}

.nexus-shell.maximized :deep(.ant-layout-header) {
  height: 0 !important;
  padding: 0 !important;

  opacity: 0;
  transform: translateY(-10px) scale(0.98);
  pointer-events: none;
}

.nexus-shell :deep(.tags-view) {
  transition:
    padding var(--ani) var(--ease),
    margin var(--ani) var(--ease),
    transform var(--ani) var(--ease),
    box-shadow var(--ani) var(--ease);
  transform-origin: top left;
}

.nexus-shell.maximized :deep(.tags-view) {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(0);
}

.nexus-shell.maximized :deep(.ant-layout-content) {
  margin: 0 !important;
  padding: 12px !important;
  transform: translateY(0);
}

.nexus-shell :deep(.ant-layout-content) {
  transition:
    margin var(--ani) var(--ease),
    padding var(--ani) var(--ease),
    transform var(--ani) var(--ease);
  transform-origin: top left;
}

.nexus-shell :deep(.ant-layout) {
  background: #F1F3F6;
}
</style>
