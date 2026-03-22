<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="getCachedViews()">
      <component :is="Component" :key="route.name" />
    </keep-alive>
  </router-view>
</template>
<script setup lang="ts">
import { useTagsViewStore } from '@/stores/tagsView'

defineOptions({ name: 'BlankLayout' })

const tagsViewStore = useTagsViewStore()
const getCachedViews = () => {
  const cached = tagsViewStore.cachedViews
  return cached
}


</script>
