import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'
import { router } from './router'
import { setupPermissionDirective } from './utils/permission'
import './assets/main.css'
import 'ant-design-vue/dist/reset.css'

import 'vxe-pc-ui/es/style.css'
import 'vxe-table/es/style.css'

import { VxePager } from 'vxe-pc-ui'
import { } from 'vxe-pc-ui'
import 'vxe-pc-ui/es/style.css'
import {
    VxeGrid,
    VxeToolbar
} from 'vxe-table'
import 'vxe-table/lib/style.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPersistedstate)
app.use(pinia)
app.use(router)
app.use(VxeGrid)
app.use(VxeToolbar)
app.use(VxePager)

// 注册权限指令
setupPermissionDirective(app)

app.mount('#app')
