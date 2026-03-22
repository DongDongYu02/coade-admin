<template>
  <div class="tags-view flex items-center gap-2">

    <div ref="wrapRef" class="flex-1 overflow-hidden" style="margin:6px 6px 6px 6px">
      <a-tabs v-model:activeKey="activeKey" type="editable-card" size="small" hide-add @tabClick="onTabClick"
        @edit="onEdit">
        <a-tab-pane v-for="item in visitedViews" :key="item.fullPath"
          :closable="!item.affix && visitedViews.length > 1">
          <template #tab>
            <span class="tab-label">
              <span v-if="item.icon" class="tab-icon-wrapper">
                <component :is="resolveIcon(item.icon)" class="tab-icon" />
              </span>
              {{ item.title }}
            </span>
          </template>
        </a-tab-pane>
      </a-tabs>
    </div>

    <div class="shrink-0 h-full">

      <a-dropdown trigger="click" placement="bottomRight" overlayClassName="tagsview-ops-dropdown">
        <template #overlay>
          <a-menu @click="onOpsMenuClick">
            <a-menu-item key="close" :disabled="isOnlyOneTab">
              <close-outlined />
              关闭
            </a-menu-item>

            <a-menu-item key="reload">
              <reload-outlined />
              重新加载
            </a-menu-item>

            <a-menu-item key="fullscreen">
              <fullscreen-outlined />
              {{ isMaximized ? '退出最大化' : '最大化' }}
            </a-menu-item>

            <a-menu-item key="openNew">
              <export-outlined />
              在新窗口打开
            </a-menu-item>

            <a-menu-divider />

            <a-menu-item key="closeLeft" :disabled="!hasLeftClosable">
              <left-outlined />
              关闭左侧标签页
            </a-menu-item>

            <a-menu-item key="closeRight" :disabled="!hasRightClosable">
              <right-outlined />
              关闭右侧标签页
            </a-menu-item>

            <a-menu-item key="closeOthers" :disabled="isOnlyOneTab">
              <swap-outlined />
              关闭其它标签页
            </a-menu-item>

            <a-menu-item key="closeAll" :disabled="isOnlyOneTab">
              <delete-outlined />
              关闭全部标签页
            </a-menu-item>
          </a-menu>
        </template>
        <button
          class="border-l border-r border-r-[#F0F0F0] w-11 text-[#71717A] border-l-[#F0F0F0] h-full cursor-pointer hover:bg-gray-100">
          <icon-arrow-down />
        </button>
      </a-dropdown>
      <button class="border-r border-r-[#F0F0F0] w-11 text-[#71717A]  h-full cursor-pointer hover:bg-gray-100"
        @click="appStore.toggleMaximize">
        <fullscreen-outlined v-if="!isMaximized" />
        <fullscreen-exit-outlined v-else />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/stores/tagsView'
import { resolveIcon } from '@/router/dynamic'
import IconArrowDown from '@/components/icon/IconArrowDown.vue'
import {
  CloseOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  ExportOutlined,
  LeftOutlined,
  RightOutlined,
  SwapOutlined,
  DeleteOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const isMaximized = computed(() => appStore.maximized)
const route = useRoute()
const router = useRouter()
const tagsStore = useTagsViewStore()

const visitedViews = computed(() => {
  console.log(tagsStore.visitedViews);
  
  return tagsStore.visitedViews
})

const activeKey = computed({
  get: () => route.fullPath,
  set: (val) => router.push(val)
})

const onTabClick = (key: string) => router.push(key)

const onEdit = (targetKey: string, action: 'add' | 'remove') => {
  if (action === 'remove') closeTab(targetKey)
}

const closeTab = (fullPath: string) => {
  const list = tagsStore.visitedViews
  if (list.length <= 1) return

  const idx = list.findIndex(v => v.fullPath === fullPath)
  if (idx === -1) return

  const view = list[idx]
  if (!view) return
  if (view.affix) return


  const isActive = route.fullPath === fullPath

  const nextView = isActive
    ? (list[idx - 1] || list[idx + 1])
    : undefined

  tagsStore.delView({
    ...route,
    fullPath: view.fullPath,
    path: view.path,
    name: view.name as any
  } as any)

  if (isActive && nextView) {
    router.push(nextView.fullPath)
  }

}

import type { MenuProps } from 'ant-design-vue'

// 当前 tabs 列表
const list = computed(() => tagsStore.visitedViews)

// 当前激活 tab 下标
const currentIndex = computed(() => list.value.findIndex(v => v.fullPath === route.fullPath))

// 只有一个 tab
const isOnlyOneTab = computed(() => list.value.length <= 1)

// 是否存在左侧可关闭 tab
const hasLeftClosable = computed(() => {
  const idx = currentIndex.value
  if (idx <= 0) return false
  return list.value.slice(0, idx).some(v => !v.affix)
})

// 是否存在右侧可关闭 tab
const hasRightClosable = computed(() => {
  const idx = currentIndex.value
  if (idx < 0) return false
  return list.value.slice(idx + 1).some(v => !v.affix)
})

// 关闭左侧
const closeLeftTabs = () => {
  const idx = currentIndex.value
  if (idx <= 0) return

  const left = list.value.slice(0, idx).filter(v => !v.affix)
  left.forEach(v => {
    tagsStore.delView({
      ...route,
      fullPath: v.fullPath,
      path: v.path,
      name: v.name as any
    } as any)
  })
}

// 关闭右侧
const closeRightTabs = () => {
  const idx = currentIndex.value
  if (idx < 0) return

  const right = list.value.slice(idx + 1).filter(v => !v.affix)
  right.forEach(v => {
    tagsStore.delView({
      ...route,
      fullPath: v.fullPath,
      path: v.path,
      name: v.name as any
    } as any)
  })
}


// 新窗口打开
const openInNewWindow = () => {
  const url = router.resolve(route.fullPath).href
  window.open(url, '_blank')
}

const onOpsMenuClick: MenuProps['onClick'] = ({ key }) => {
  switch (key) {
    case 'close':
      closeTab(route.fullPath)
      break

    case 'reload':
      router.replace({ path: '/redirect' + route.path, query: route.query })
      break

    case 'fullscreen':
      appStore.toggleMaximize()
      break

    case 'openNew':
      openInNewWindow()
      break

    case 'closeLeft':
      closeLeftTabs()
      break

    case 'closeRight':
      closeRightTabs()
      break

    case 'closeOthers':
      tagsStore.delOthersViews(route as any)
      break

    case 'closeAll':
      tagsStore.delAllViews()
      // 关完后跳到第一个 tab（通常是 affix 的 dashboard）
      if (tagsStore.visitedViews[0]) router.push(tagsStore.visitedViews[0].fullPath)
      break
  }
}




</script>

<style scoped>
.tags-view {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;

  overflow: hidden;
  width: 100%;
}

/* 改 Ant Tabs 样式 */
:deep(.ant-tabs) {
  margin: 0;
}

:deep(.ant-tabs-nav) {
  margin: 0 !important;
}

/* 去掉底部默认线 */
:deep(.ant-tabs-nav::before) {
  border-bottom: none !important;
}

/* 每个 tab 的基础样式（非激活） */
:deep(.ant-tabs-card .ant-tabs-tab) {
  padding: 0 10px;
  margin: 0 6px 0 0 !important;

  border-radius: 6px !important;
  border: 1px solid #e5e7eb !important;
  background: #fff !important;

  display: inline-flex;
  align-items: center;

  transition: all 0.15s;
}

/* hover */
:deep(.ant-tabs-card .ant-tabs-tab:hover) {
  background: #f5f5f5 !important;
}

/*  激活 tab：浅蓝底 + 蓝字 */
:deep(.ant-tabs-card .ant-tabs-tab.ant-tabs-tab-active) {
  background: #e6f4ff !important;
  border-color: #91caff !important;
}

/* 激活 tab 字体颜色 */
:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #1677ff !important;
  font-weight: 600;
}

/* tab 文字 */
.tab-label {
  font-size: 13px;
  line-height: 28px;
  display: inline-flex;
  align-items: center;
}

.tab-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

.tab-icon {
  font-size: 13px;
  animation: tabIconFadeIn 0.25s ease-out;
}

@keyframes tabIconFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}



/* 关闭按钮 hover */
:deep(.ant-tabs-tab-remove:hover) {
  background: rgba(0, 0, 0, 0.06);
}

/* 让 Tab 内容整体居中 */
:deep(.ant-tabs-card .ant-tabs-tab) {
  display: inline-flex !important;
  align-items: center !important;
  height: 35px !important;
}

/* 让 tab 内部 label + close 按钮在同一水平线 */
:deep(.ant-tabs-card .ant-tabs-tab .ant-tabs-tab-btn) {
  display: inline-flex !important;
  align-items: center !important;
  line-height: 1 !important;
}

/* 关闭按钮对齐 */
:deep(.ant-tabs-card .ant-tabs-tab .ant-tabs-tab-remove) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: width 0.15s ease, margin-left 0.15s ease, opacity 0.15s ease;
  position: absolute;
  right: 5px;
  top: 1px;
  opacity: 0;
  padding: 0 !important;
  border-radius: 4px;
  line-height: 1 !important;
}


:deep(.ant-tabs-card .ant-tabs-tab:hover .ant-tabs-tab-remove) {
  opacity: 1;
  pointer-events: auto;
}

/* 关闭图标大小 */
:deep(.ant-tabs-card .ant-tabs-tab .ant-tabs-tab-remove .anticon) {
  font-size: 11px;
}

:global(.ant-tabs-dropdown-menu-title-content) {
  border-radius: 6px !important;
  border: 1px solid #e5e7eb !important;
  background: #fff !important;

  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.15s !important;
}

:global(.ant-tabs-dropdown-menu-title-content .ant-tabs-dropdown-menu-item-remove) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 0 !important;
  opacity: 0 !important;
  overflow: hidden !important;
  transition: width 0.15s ease, margin-left 0.15s ease, opacity 0.15s ease;
  pointer-events: none !important;
  margin-left: 0 !important;
  font-size: 13px !important;
}

:global(.ant-tabs-dropdown-menu-title-content:hover .ant-tabs-dropdown-menu-item-remove) {
  width: 18px !important;
  height: 18px !important;
  margin-left: 6px !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

:global(.ant-tabs-dropdown-menu-title-content .ant-tabs-dropdown-menu-item-remove:hover) {
  background: rgba(0, 0, 0, 0.06);
}


:global(.tagsview-ops-dropdown .ant-dropdown-menu) {
  border-radius: 10px;
  padding: 6px;
  min-width: 160px;
}

:global(.tagsview-ops-dropdown .ant-dropdown-menu-item) {
  border-radius: 8px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

:global(.tagsview-ops-dropdown .ant-dropdown-menu-item .ant-dropdown-menu-title-content) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:global(.tagsview-ops-dropdown .ant-dropdown-menu-item-disabled) {
  opacity: 0.45;
}
</style>
