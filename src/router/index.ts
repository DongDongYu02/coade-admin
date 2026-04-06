import { getUserPermissionsApi } from '@/api/auth'
import { DEFAULT_LOGO } from '@/config/global'
import BasicLayout from '@/layouts/BasicLayout.vue'
import NProgress from '@/plugins/nprogress'
import { buildRoutesFromMenus } from '@/router/dynamic'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useTagsViewStore } from '@/stores/tagsView'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
const FILE_ACCESS_URL = import.meta.env.VITE_FILE_ACCESS_URL
const WHITE_LIST = ['/login']

/** ✅ 常量路由：只放登录、redirect、壳、基础页面、404 */
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect/:pathMatch(.*)*',
    name: 'Redirect',
    component: () => import('@/views/Redirect.vue'),
    meta: { hideTab: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { hideTab: true }
  },
  {
    path: '/',
    name: 'Root',
    component: BasicLayout,
    // 不设置 redirect，在 beforeEach 中动态处理
    children: [
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { hideTab: true }
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

/** ✅ 记录本次 session 动态 add 过哪些 route，退出/换号时可 remove */
const addedRouteNames = new Set<string>()

function addDynamicRoutes(dynamicRoutes: RouteRecordRaw[]) {
  for (const r of dynamicRoutes) {
    // 有 name 的路由检查是否重复
    if (r.name && router.hasRoute(r.name)) continue
    router.addRoute('Root', r)
    if (r.name) addedRouteNames.add(String(r.name))
  }
}

/** （可选）登出时调用：清掉动态路由 */
export function resetDynamicRoutes() {
  for (const name of addedRouteNames) {
    if (router.hasRoute(name)) router.removeRoute(name)
  }
  addedRouteNames.clear()
}

router.beforeEach(async (to, from, next) => {
  if (to.fullPath !== from.fullPath) NProgress.start()
  const target = to.fullPath
  const authStore = useAuthStore()
  const token = authStore.token
  // 1) 无 token：去登录（带 redirect）
  if (!token) {
    if (WHITE_LIST.includes(to.path)) return next()
    NProgress.done()

    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 2) 已登录访问 login：回首页
  if (to.path === '/login') {
    NProgress.done()
    return next('/')
  }

  // 3) 已登录但还没加载动态路由：拉菜单 → addRoute → 重新进入目标路由
  if (!authStore.routesLoaded) {
    try {
      const resp = await getUserPermissionsApi()
      console.log(resp);

      const menus = resp?.data.permissions ?? []
      const authCodes = resp?.data.authCodes ?? []
      const indexPath = resp?.data.index || '/'

      // 保存用户首页地址和权限码到 store
      authStore.indexPath = indexPath
      authStore.setMenus?.(menus)
      authStore.setAuthCodes?.(authCodes)

      const dynamicRoutes = buildRoutesFromMenus(menus)
      addDynamicRoutes(dynamicRoutes)
      authStore.routesLoaded = true

      let finalTarget = to.path === '/' ? indexPath : target
      return next({ path: finalTarget, replace: true })
    } catch (e) {
      console.error('[dynamic-route] 加载失败：', e)
      authStore.clearToken?.()
      resetDynamicRoutes()
      NProgress.done()
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }
  }

  // 4) 已加载动态路由，访问根路径时重定向到用户首页
  if (to.path === '/' && authStore.indexPath) {
    NProgress.done()
    return next({ path: authStore.indexPath, replace: true })
  }

  next()
})

router.afterEach((to) => {
  const tagsViewStore = useTagsViewStore()
  const appStore = useAppStore()
  console.log(to);

  if (!to.meta?.hideTab) tagsViewStore.addView(to)

  // 更新浏览器标签页标题：菜单名称 - 系统名称
  const pageTitle = to.meta?.title as string
  const systemName = appStore.systemName || '管理后台'
  document.title = pageTitle ? `${pageTitle} - ${systemName}` : systemName

  // 更新浏览器标签页图标
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (favicon) {
    favicon.href = appStore.systemLogo ? FILE_ACCESS_URL + appStore.systemLogo : DEFAULT_LOGO
  }

  NProgress.done()
})

router.onError(() => {
  NProgress.done()
})

export default router
