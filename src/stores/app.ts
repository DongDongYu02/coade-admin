import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    maximized: false,
    systemName: "管理后台",
    systemLogo: ""
  }),
  actions: {
    toggleMaximize() {
      this.maximized = !this.maximized
    },
    exitMaximize() {
      this.maximized = false
    },
    clearSystemInfo(){
      this.systemName = "管理后台"
      this.systemLogo = ""
    }
  },
  persist: {
    key: 'app',
    storage: localStorage,
    pick: [ 'systemName', 'systemLogo']
  }
})
