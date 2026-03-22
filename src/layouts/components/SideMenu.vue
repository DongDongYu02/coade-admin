<template>
  <a-layout-sider
    v-model:collapsed="collapsedModel"
    :trigger="null"
    collapsible
    :width="width"
  >
    <!-- Logo 区域 -->
    <div
      class="text-white flex items-center transition-all duration-200"
      :class="collapsedModel ? 'justify-center py-5' : 'justify-starat pl-1 pr-2 py-2 gap-3'"
    >
      <div class="logo-wrapper flex items-center justify-center shrink-0" :class="collapsedModel ? 'w-10 h-10' : 'w-12 h-12'">
        <img :src="logo" alt="logo" class="max-w-full max-h-full object-contain" />
      </div>
      <span 
        v-if="!collapsedModel" 
        class="whitespace-nowrap text-[22px] font-semibold tracking-wide bg-linear-to-r from-white to-blue-200 bg-clip-text text-transparent truncate"
      >
        {{ title }}
      </span>
    </div>

    <!-- Menu -->
    <a-menu
      theme="dark"
      mode="inline"
      v-model:selectedKeys="selectedKeysModel"
      v-model:openKeys="openKeysModel"
      :items="menuItems"
      @click="onClick"
    />
  </a-layout-sider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuProps } from 'ant-design-vue'
//  Props
const props = withDefaults(
  defineProps<{
    collapsed: boolean
    width?: number
    logo: string
    title?: string
    menuItems: MenuProps['items']
    selectedKeys: string[]
    openKeys: string[]
  }>(),
  {
    width: 220,
    title: 'Nexus Admin'
  }
)

//  Emits（v-model）
const emit = defineEmits<{
  (e: 'update:collapsed', v: boolean): void
  (e: 'update:selectedKeys', v: string[]): void
  (e: 'update:openKeys', v: string[]): void
  (e: 'menuClick', key: string): void
}>()

// collapsed v-model
const collapsedModel = computed({
  get: () => props.collapsed,
  set: (v) => emit('update:collapsed', v)
})

// selectedKeys v-model
const selectedKeysModel = computed({
  get: () => props.selectedKeys,
  set: (v) => emit('update:selectedKeys', v)
})

// openKeys v-model
const openKeysModel = computed({
  get: () => props.openKeys,
  set: (v) => emit('update:openKeys', v)
})

// 点击菜单
function onClick({ key }: { key: string }) {
  emit('menuClick', key)
}
</script>
