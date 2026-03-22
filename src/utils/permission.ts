import { useAuthStore } from '@/stores/auth'
import type { App, Directive } from 'vue'

/**
 * 检查是否拥有指定权限
 * @param code 权限码，可以是单个字符串或字符串数组
 * @returns 是否拥有权限
 */
export function hasPermission(code: string | string[]): boolean {
  const authStore = useAuthStore()
  return authStore.hasPermission(code)
}

/**
 * 权限指令 v-permission
 * 用法：
 *   v-permission="'sys:user:add'"          - 单个权限
 *   v-permission="['sys:user:add']"        - 数组形式
 *   v-permission="['sys:user:add', 'sys:user:edit']" - 满足其一即可
 */
const permissionDirective: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const code = binding.value
    if (!code) return

    if (!hasPermission(code)) {
      // 无权限时移除元素
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 权限组合式函数
 * @example
 * const { hasPermission, hasAllPermission } = usePermission()
 * if (hasPermission('sys:user:add')) { ... }
 */
export function usePermission() {
  const authStore = useAuthStore()

  return {
    /** 检查是否拥有指定权限 */
    hasPermission: (code: string | string[]) => authStore.hasPermission(code),
    /** 是否拥有所有权限（超级管理员） */
    hasAllPermission: authStore.hasAllPermission,
    /** 当前用户的权限码列表 */
    authCodes: authStore.authCodes
  }
}

/**
 * 注册权限指令
 */
export function setupPermissionDirective(app: App) {
  app.directive('permission', permissionDirective)
}
