<template>

    <a-layout-content :style="contentStyle" class="layout-content">
        <router-view v-slot="{ Component, route }">
            <transition name="fade-slide" mode="out-in">
                <keep-alive :include="cachedViews" :max="cachedViews.length || 0">
                    <component :is="Component" class="route-page" :key="route.name" />
                </keep-alive>
            </transition>
        </router-view>
    </a-layout-content>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useTagsViewStore } from '@/stores/tagsView'

const props = defineProps<{
    maximized?: boolean
}>()

const tagsViewStore = useTagsViewStore()

// 直接从 store 获取
const cachedViews = computed(() => {
    const views = tagsViewStore.cachedViews
    console.log('🔶 AppContent cachedViews:', views)
    return views
})

const contentStyle = computed(() => {
    if (props.maximized) {
        return {
            margin: '0',
            padding: '12px',
            minHeight: '0',
            overflow: 'auto',
        }
    }
    return {
        margin: '10px',
        minHeight: '280px'
    }
})
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.25s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateX(-10px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(10px);
}

/* a-layout-content 本体 */
.layout-content {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* 防止页面外层出现滚动条 */
}

/* transition 包裹层 */
.route-anim-wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

/* 给每个页面组件一个“默认满高”能力 */
:deep(.route-page) {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
</style>
