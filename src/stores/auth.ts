import type { PermissionNode } from '@/router/dynamic'
import { defineStore } from 'pinia'

export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    routesLoaded: false,
    menus: [] as PermissionNode[],
    authCodes: [] as string[],
    indexPath: '/',
    userInfo: null as UserInfo | null,
    loginAccountName:''
  }),
  getters: {
    /** 是否拥有所有权限 */
    hasAllPermission: (state) => state.authCodes.includes('*'),
    /** 用户昵称 */
    nickname: (state) => state.userInfo?.nickname || state.userInfo?.username || '',
    /** 用户头像 */
    avatar: (state) => state.userInfo?.avatar || '',
  },
  actions: {
    setMenus(m: PermissionNode[]) {
      this.menus = m ?? []
    },
    setAuthCodes(codes: string[]) {
      this.authCodes = codes ?? []
    },
    setUserInfo(user: UserInfo | null) {
      this.userInfo = user
    },
    setToken(t: string) {
      this.token = t
    },
    setLoginAccountName(name:string){
      this.loginAccountName = name
    },
    /** 检查是否拥有指定权限 */
    hasPermission(code: string | string[]): boolean {
      if (this.hasAllPermission) return true
      const codes = Array.isArray(code) ? code : [code]
      return codes.some(c => this.authCodes.includes(c))
    },
    clearToken() {
      this.token = ''
      this.routesLoaded = false
      this.menus = []
      this.authCodes = []
      this.indexPath = '/'
      this.userInfo = null
    }
  },
  persist: {
    key: 'auth',
    storage: localStorage,
    pick: ['token', 'indexPath','userInfo','loginAccountName']
  }
})
