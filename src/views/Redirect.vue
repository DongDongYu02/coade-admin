<template></template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
    // /redirect/xxx -> /xxx
    const targetPath = (route.params.pathMatch as string[])?.join('/') || ''
    const fullPath = '/' + targetPath

    router.replace({
        path: fullPath,
        query: route.query
    })
})
</script>
