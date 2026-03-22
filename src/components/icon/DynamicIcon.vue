<template>
    <component v-if="iconComponent" :is="iconComponent" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from 'vue'

const props = defineProps<{
    name?: string
}>()

const iconComponent = computed<Component | null>(() => {
    if (!props.name) return null
    
    return defineAsyncComponent({
        loader: () => import('@ant-design/icons-vue').then(mod => {
            const icon = (mod as Record<string, Component>)[props.name!]
            if (!icon) {
                console.warn(`Icon "${props.name}" not found`)
                return Promise.reject()
            }
            return icon
        }),
        errorComponent: () => null
    })
})
</script>
