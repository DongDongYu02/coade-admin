// src/router/dynamic.ts
import type { MenuProps } from 'ant-design-vue'
import type { Component } from 'vue'
import { defineAsyncComponent, defineComponent, h } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
export interface PermissionNode {
    id: string
    parentId: string
    name: string
    path: string
    hidden: 0 | 1
    redirect?: string
    component?: string
    type: 1 | 2 | 3 // 1目录 2菜单 3按钮
    icon?: string
    sort?: number
    meta?: {
        icon?: string
        keepAlive?: 0 | 1
        affix?: 0 | 1
        [k: string]: any
    }
    children?: PermissionNode[]
}

const viewModules = import.meta.glob('/src/views/**/*.vue')


function normalizePath(p?: string) {
    return (p ?? '').trim()
}

/** 生成组件名称：system/user/Index -> SystemUserIndex */
function generateComponentName(componentPath: string): string {
    return componentPath
        .replace(/^\/+/, '')
        .split('/')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
        .replace(/\.vue$/, '')
}

/** 包装组件，自动注入 name 以支持 keep-alive */
function resolveViewWithName(component: string, componentName: string) {
    const raw = normalizePath(component)
    const noLeadSlash = raw.replace(/^\/+/, '')
    const full = `/src/views/${noLeadSlash}.vue`

    const loader = (viewModules as Record<string, any>)[full]
    if (!loader) {
        console.warn(`[dynamic-route] 找不到组件：${component} -> ${full}`)
        return () => import('@/views/error/404.vue')
    }

    // 返回动态导入函数，Vue Router 会自动处理异步组件
    return async () => {
        const mod = await loader()
        const comp = mod.default || mod
        // 自动注入组件名
        comp.name = comp.name || componentName
        return comp
    }
}

function sortChildren(list?: PermissionNode[]) {
    return (list ?? []).slice().sort((a, b) => (a.sort ?? 999999) - (b.sort ?? 999999))
}

/** ✅ 路由扁平化：把后端菜单树转成扁平的路由数组，所有页面都是 Root 的直接子路由 */
export function buildRoutesFromMenus(menus: PermissionNode[]): RouteRecordRaw[] {
    const flatRoutes: RouteRecordRaw[] = []

    // 递归提取所有叶子节点（实际页面）
    function extractLeafRoutes(nodes: PermissionNode[], parentPath = '') {
        for (const node of sortChildren(nodes)) {
            if (node.type === 3) continue // 跳过按钮权限

            const currentPath = normalizePath(node.path).replace(/^\/+/, '')
            const fullPath = parentPath ? `${parentPath}/${currentPath}` : currentPath

            // 目录类型：添加重定向路由
            if (node.type === 1) {
                // 计算重定向目标：优先使用配置的 redirect，否则使用第一个可见子菜单
                let redirectTarget = node.redirect
                if (!redirectTarget && node.children?.length) {
                    const firstVisibleChild = sortChildren(node.children).find(c => c.hidden !== 1 && c.type !== 3)
                    if (firstVisibleChild) {
                        const childPath = normalizePath(firstVisibleChild.path).replace(/^\/+/, '')
                        redirectTarget = `/${fullPath}/${childPath}`
                    }
                }

                if (redirectTarget) {
                    // 生成重定向路由名称
                    const redirectRouteName = `Redirect_${fullPath.replace(/\//g, '_')}`
                    flatRoutes.push({
                        path: fullPath,
                        name: redirectRouteName,
                        redirect: redirectTarget,
                        meta: {
                            title: node.name,
                            hidden: true
                        }
                    })
                    console.log('📋 重定向路由:', `/${fullPath}`, '→', redirectTarget)
                }
            }

            // 只处理叶子节点（有 component 的菜单项）
            if (node.type === 2 && node.component) {
                // 生成组件名称
                const componentPath = normalizePath(node.component)
                const componentName = generateComponentName(componentPath)

                flatRoutes.push({
                    path: fullPath,
                    name: componentName,
                    component: resolveViewWithName(node.component, componentName),
                    meta: {
                        title: node.name,
                        icon: node.meta?.icon ?? node.icon ?? '',
                        hidden: node.hidden === 1,
                        keepAlive: node.meta?.keepAlive === 1,
                        affix: node.meta?.affix === 1,
                        permissionId: node.id
                    }
                })

                console.log('📋 扁平化路由:', fullPath, '→', componentName, 'keepAlive:', node.meta?.keepAlive === 1)
            }

            // 递归处理子节点
            if (node.children?.length) {
                extractLeafRoutes(node.children, fullPath)
            }
        }
    }

    extractLeafRoutes(menus)
    return flatRoutes
}

export function buildMenuItemsFromMenus(
    menus: PermissionNode[],
    parentFullPath = ''
): MenuProps['items'] {
    const items: MenuProps['items'] = []

    for (const n of sortChildren(menus)) {
        if (n.hidden === 1) continue
        if (n.type === 3) continue

        const seg = normalizePath(n.path).replace(/^\/+/, '')
        const fullPath = joinFullPath(parentFullPath, seg)

        const children = n.children?.length
            ? buildMenuItemsFromMenus(n.children, fullPath)
            : undefined

        // 目录：如果 children 为空，就不显示
        if (n.type === 1 && (!children || children.length === 0)) continue

        // 获取图标名称
        const iconName = n.icon || n.meta?.icon

        items.push({
            key: fullPath,
            label: n.name,
            icon: iconName ? () => h(resolveIcon(iconName)) : undefined,
            children: children && children.length ? children : undefined
        })
    }

    return items
}

const EmptyIcon = defineComponent({
    name: 'EmptyIcon',
    render: () => null
})

/** 图标组件缓存 */
const iconCache = new Map<string, Component>()

/** 动态解析图标组件（带缓存） */
export function resolveIcon(name: string): Component {
    if (iconCache.has(name)) return iconCache.get(name)!

    const asyncIcon = defineAsyncComponent({
        loader: async () => {
            const mod = await import('@ant-design/icons-vue')
            const icon = (mod as Record<string, Component>)[name]
            if (!icon) {
                console.warn(`[dynamic-route] Icon "${name}" not found`)
                return EmptyIcon 
            }
            return icon
        },
        errorComponent: EmptyIcon
    })

    iconCache.set(name, asyncIcon)
    return asyncIcon
}

function joinFullPath(parent: string, seg: string) {
    const p = parent.replace(/\/+$/, '')
    const s = seg.replace(/^\/+/, '')
    if (!p) return `/${s}`
    return `/${[p.replace(/^\/+/, ''), s].filter(Boolean).join('/')}`
}

export interface BreadcrumbItem {
    title: string
    icon?: string
}

/** 根据当前路径从菜单树生成面包屑 */
export function buildBreadcrumbs(menus: PermissionNode[], currentPath: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = []
    const targetPath = currentPath.replace(/^\/+/, '')

    function findPath(nodes: PermissionNode[], parentPath = ''): boolean {
        for (const node of sortChildren(nodes)) {
            if (node.type === 3) continue

            const seg = normalizePath(node.path).replace(/^\/+/, '')
            const fullPath = parentPath ? `${parentPath}/${seg}` : seg

            // 检查是否匹配当前路径或是当前路径的父级
            if (targetPath === fullPath || targetPath.startsWith(fullPath + '/')) {
                breadcrumbs.push({
                    title: node.name,
                    icon: node.icon || node.meta?.icon
                })

                // 如果完全匹配，返回 true
                if (targetPath === fullPath) {
                    return true
                }

                // 继续查找子节点
                if (node.children?.length) {
                    if (findPath(node.children, fullPath)) {
                        return true
                    }
                }

                // 没有找到匹配的子节点，但当前节点是路径前缀，保留面包屑
                return true
            }
        }
        return false
    }

    findPath(menus)
    return breadcrumbs
}
