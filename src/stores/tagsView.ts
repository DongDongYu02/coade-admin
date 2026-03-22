import { defineStore } from 'pinia'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export interface TagView {
  fullPath: string
  path: string
  name?: string
  title: string
  icon?: string
  affix?: boolean
  keepAlive?: boolean
}

function getTitle(route: RouteLocationNormalizedLoaded) {
  return (route.meta?.title as string) || (route.name as string) || route.path
}

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [] as TagView[],
    cachedViews: [] as string[] // KeepAlive include 用（组件名）
  }),

  actions: {
    addView(route: RouteLocationNormalizedLoaded) {
      if (route.meta?.hideTab) return
      this.addVisitedView(route)
      this.addCachedView(route)
    },

    addVisitedView(route: RouteLocationNormalizedLoaded) {
      const fullPath = route.fullPath
      if (this.visitedViews.some(v => v.fullPath === fullPath)) return

      this.visitedViews.push({
        fullPath,
        path: route.path,
        name: route.name as string,
        title: getTitle(route),
        icon: route.meta?.icon as string | undefined,
        affix: !!route.meta?.affix,
        keepAlive: !!route.meta?.keepAlive
      })
    },

    addCachedView(route: RouteLocationNormalizedLoaded) {
      console.log('route：', route);

      if (!route.meta?.keepAlive) {
        console.log('❌ addCachedView: keepAlive=false, 不缓存', route.name)
        return
      }
      const name = route.name as string
      if (!name) {
        console.log('❌ addCachedView: route.name 为空')
        return
      }
      if (this.cachedViews.includes(name)) {
        console.log('✅ addCachedView: 已在缓存中', name)
        return
      }
      this.cachedViews.push(name)
      console.log('✅ addCachedView: 添加到缓存', name, '当前缓存:', [...this.cachedViews])
    },

    delView(route: RouteLocationNormalizedLoaded) {
      this.delVisitedView(route)
      this.delCachedView(route)
    },

    delVisitedView(route: RouteLocationNormalizedLoaded) {
      const idx = this.visitedViews.findIndex(v => v.fullPath === route.fullPath)
      if (idx >= 0) this.visitedViews.splice(idx, 1)
    },

    delCachedView(route: RouteLocationNormalizedLoaded) {
      const name = route.name as string
      if (!name) return
      const idx = this.cachedViews.indexOf(name)
      if (idx >= 0) this.cachedViews.splice(idx, 1)
    },

    delOthersViews(route: RouteLocationNormalizedLoaded) {
      this.visitedViews = this.visitedViews.filter(v => v.affix || v.fullPath === route.fullPath)
      this.cachedViews = this.cachedViews.filter(name => name === (route.name as string))
    },

    delAllViews() {
      this.visitedViews = this.visitedViews.filter(v => v.affix)
      this.cachedViews = []
    }
  },
  persist: {
    key: 'nexus-tags-view',
    storage: sessionStorage,
    pick: ['visitedViews', 'cachedViews']
  }
})
