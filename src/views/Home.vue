<template>
  <div style="padding: 24px">
    <a-card title="Vue3 + Vite + Pinia + Ant Design Vue (TS)">
      <div style="display:flex; gap: 12px; align-items: center;">
        <a-tag color="blue">count: {{ number }}</a-tag>
        <a-button type="primary" @click="number++">+1</a-button>
        <h1 class="text-3xl font-bold underline">Hello Tailwind</h1>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue';

defineOptions({
  name: 'Workbench'
})

const number = ref(1)

onMounted(() => {
  console.log('✅ Workbench - onMounted (组件首次创建)')
})

onUnmounted(() => {
  console.log('❌ Workbench - onUnmounted (组件被销毁)')
})

onActivated(() => {
  console.log('🔄 Workbench - onActivated (从缓存中激活)')
})

onDeactivated(() => {
  console.log('💤 Workbench - onDeactivated (被缓存)')
})
</script>
