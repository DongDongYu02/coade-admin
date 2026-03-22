<template>
    <div class="login-page">
        <!-- 背景 -->
        <div class="bg-layer"></div>

        <!-- 顶部栏 -->
        <div class="fixed left-6 top-5 z-10 flex items-center gap-2 select-none">
            <img :src="systemLogo || DEFAULT_LOGO" alt="Logo" class="h-12 w-12 object-contain" />
            <span class="text-[20px] text-slate-900">{{ systemName || DEFAULT_SYSTEM_NAME }}</span>
        </div>



        <!-- 登录卡片 -->
        <div class="relative z-10 flex min-h-screen items-center justify-center px-4">
            <div class="login-card">
                <div class="mb-7">
                    <div class="flex items-center gap-2 justify-between">
                        <div class="text-[26px] font-bold text-slate-900 flex items-center gap-2">
                            欢迎回来 <span class="text-[22px]">👋</span>
                        </div>
                        <img :src="systemLogo || DEFAULT_LOGO" alt="Nexus Logo" class="h-12 w-12 object-contain" />

                    </div>
                    <div class="mt-2 text-[13px] text-slate-500">
                        请输入您的账号信息以开始使用管理后台
                    </div>
                </div>

                <a-form :model="form" layout="vertical" @finish="onSubmit">

                    <!-- 用户名 -->
                    <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名' }]">
                        <a-input v-model:value="form.username" size="large" placeholder="请输入用户名"
                            autocomplete="username" />
                    </a-form-item>

                    <!-- 密码 -->
                    <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
                        <a-input-password v-model:value="form.password" size="large" placeholder="请输入密码"
                            autocomplete="current-password" />
                    </a-form-item>

                    <!-- 登录按钮 -->
                    <a-button type="primary" html-type="submit" size="large" block :loading="loading" class="h-10!">
                        登录
                    </a-button>

                    <div class="mt-6 text-center text-[12px] text-slate-400">
                        Copyright © {{ year }} Dong
                    </div>
                </a-form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter, useRoute } from 'vue-router'
import { loginApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { getSystemSettingApi } from '@/api/setting'
import { useAppStore } from '@/stores/app'
import { FILE_ACCESS_URL } from '@/config/global'
import { DEFAULT_LOGO, DEFAULT_SYSTEM_NAME } from '@/config/global'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

type LoginForm = {
    username: string
    password: string
}

const systemName = computed(() => appStore.systemName)
const systemLogo = computed(() => {
    if (appStore.systemLogo) {
        return FILE_ACCESS_URL + appStore.systemLogo
    }
    return ""
})
const year = computed(() => new Date().getFullYear())

const form = reactive<LoginForm>({
    username: authStore.loginAccountName || '',
    password: '',
})

const loadSystemSetting = async () => {
    const resp = await getSystemSettingApi()
    appStore.systemName = resp.data?.systemName
    appStore.systemLogo = resp.data?.systemLogo
}

const loading = ref(false)

const onSubmit = async () => {
    loading.value = true
    try {
        const res = await loginApi(form)
        console.log(res);
        message.success('登录成功')
        authStore.setToken(res.data.token)
        authStore.setUserInfo(res.data.userInfo)
        authStore.setLoginAccountName(form.username)
        // 登录成功后跳转到首页
        const redirect = (route.query.redirect as string) || '/'
        router.replace(redirect)
    } finally {
        loading.value = false
    }
}
loadSystemSetting()
</script>

<style scoped>
/* 页面基础背景 */
.login-page {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    background: #f8fafc;
}

/* 背景渐变+光晕 */
.bg-layer {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(900px 600px at 20% 10%, rgba(255, 255, 255, 0.8), transparent 60%),
        radial-gradient(900px 600px at 80% 90%, rgba(59, 130, 246, 0.18), transparent 60%),
        radial-gradient(900px 600px at 15% 85%, rgba(99, 102, 241, 0.12), transparent 60%),
        linear-gradient(135deg, #f7f7f7 0%, #e6f3ff 50%, #f7f7f7 100%);
}

/* 卡片 */
.login-card {
    width: 550px;
    max-width: 92vw;
    background: #fff;
    border-radius: 16px;
    padding: 32px;
    box-shadow:
        0 20px 45px rgba(15, 23, 42, 0.08),
        0 8px 20px rgba(15, 23, 42, 0.06);
}
</style>
