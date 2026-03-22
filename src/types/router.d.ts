import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    affix?: boolean
    keepAlive?: boolean
    hideTab?: boolean
  }
}
