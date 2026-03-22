<template>
    <div class="setting-container">
        <a-card title="系统设置" :bordered="false">
            <template #extra>
                <a-button type="primary" :loading="saving" @click="handleSave">
                    <template #icon>
                        <SaveOutlined />
                    </template>
                    保存设置
                </a-button>
            </template>

            <a-spin :spinning="loading">
                <a-form ref="formRef" :model="formData" :rules="formRules" :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 12 }" class="setting-form">
                    <!-- 系统名称 -->
                    <a-form-item label="系统名称" name="systemName">
                        <a-input v-model:value="formData.systemName" placeholder="请输入系统名称" :maxlength="30" show-count />
                        <template #extra>
                            <span class="text-gray-400">显示在浏览器标签页和侧边栏顶部</span>
                        </template>
                    </a-form-item>

                    <!-- 系统LOGO -->
                    <a-form-item label="系统LOGO" name="systemLogo">
                        <div class="logo-upload-container">
                            <a-upload v-model:file-list="logoFileList" list-type="picture-card" :max-count="1"
                                :before-upload="beforeUpload" :custom-request="customUpload" @remove="handleRemoveLogo"
                                class="logo-uploader">
                                <div v-if="!formData.systemLogo" class="upload-placeholder">
                                    <PlusOutlined />
                                    <div style="margin-top: 8px">上传LOGO</div>
                                </div>
                            </a-upload>
                            <div class="upload-tips">
                                <p>建议尺寸：200 x 200 像素</p>
                                <p>支持格式：PNG、JPG、SVG</p>
                                <p>文件大小：不超过 2MB</p>
                            </div>
                        </div>
                    </a-form-item>

                    <!-- 预览区域 -->
                    <a-form-item label="效果预览">
                        <div class="preview-container">
                            <div class="preview-sidebar">
                                <div class="preview-logo-area">
                                    <img v-if="formData.systemLogo" :src="FILE_ACCESS_URL + formData.systemLogo"
                                        class="preview-logo" />
                                    <div v-else class="preview-logo-placeholder">
                                        <AppstoreOutlined />
                                    </div>
                                    <span class="preview-title">{{ formData.systemName || '系统名称' }}</span>
                                </div>
                                <div class="preview-menu">
                                    <div class="preview-menu-item active">
                                        <HomeOutlined />
                                        <span>首页</span>
                                    </div>
                                    <div class="preview-menu-item">
                                        <SettingOutlined />
                                        <span>系统管理</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a-form-item>
                </a-form>
            </a-spin>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { uploadFileApi } from '@/api/file'
import {
    getSystemSettingApi,
    saveSystemSettingApi,
    type ConfigDTO
} from '@/api/setting'
import { FILE_ACCESS_URL } from '@/config/global'
import { useAppStore } from '@/stores/app'
import {
    AppstoreOutlined,
    HomeOutlined,
    PlusOutlined,
    SaveOutlined,
    SettingOutlined
} from '@ant-design/icons-vue'
import { message, Upload, type FormInstance, type UploadFile, type UploadProps } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { onMounted, reactive, ref } from 'vue'
const appStore = useAppStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)

const formData = reactive<{ systemName: string; systemLogo: string }>({
    systemName: '',
    systemLogo: ''
})

const formRules: Record<string, Rule[]> = {
    systemName: [
        // { required: true, message: '请输入系统名称', trigger: 'blur' },
        { min: 2, max: 30, message: '系统名称长度为2-30个字符', trigger: 'blur' }
    ]
}

// LOGO 文件列表
const logoFileList = ref<UploadFile[]>([])

// 加载系统设置
const loadSetting = async () => {
    loading.value = true
    try {
        const res = await getSystemSettingApi()
        if (res.success && res.data) {
            formData.systemName = res.data.systemName
            formData.systemLogo = res.data.systemLogo

            // 回显 LOGO
            if (formData.systemLogo) {
                logoFileList.value = [{
                    uid: '-1',
                    name: 'logo',
                    status: 'done',
                    url: FILE_ACCESS_URL + formData.systemLogo
                }]
            }
        }
    } catch (error) {
        console.error('加载系统设置失败', error)
    } finally {
        loading.value = false
    }
}

// 上传前校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)
    if (!isImage) {
        message.error('只能上传 PNG、JPG、SVG 格式的图片')
        return Upload.LIST_IGNORE // 完全阻止添加到文件列表
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
        message.error('图片大小不能超过 2MB')
        return Upload.LIST_IGNORE // 完全阻止添加到文件列表
    }
    return true
}

// 自定义上传
const customUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    try {
        const res = await uploadFileApi(file as File)
        if (res.success && res.data) {
            formData.systemLogo = res.data.path
            onSuccess?.(res.data)
            message.success('LOGO上传成功')
        } else {
            onError?.(new Error(res.message || '上传失败'))
        }
    } catch (error: any) {
        onError?.(error)
        message.error('上传失败')
    }
}

// 移除 LOGO
const handleRemoveLogo = () => {
    formData.systemLogo = ''
    logoFileList.value = []
}

// 保存设置
const handleSave = async () => {
    try {
        await formRef.value?.validate()
        saving.value = true
        const data: ConfigDTO = {
            configs: [
                { key: 'systemName', value: formData.systemName },
                { key: 'systemLogo', value: formData.systemLogo }
            ]
        }
        await saveSystemSettingApi(data)
        appStore.systemLogo = formData.systemLogo
        appStore.systemName = formData.systemName
        message.success('保存成功')
    } catch (error: any) {
        if (error?.errorFields) return
        message.error('保存失败')
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    loadSetting()
})
</script>

<style scoped>
.setting-form {
    max-width: 800px;
}

.logo-upload-container {
    display: flex;
    gap: 24px;
    align-items: flex-start;
}

.upload-tips {
    color: #8c8c8c;
    font-size: 13px;
    line-height: 1.8;
}

.upload-tips p {
    margin: 0;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8c8c8c;
}

/* 预览区域 */
.preview-container {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 16px;
    display: inline-block;
}

.preview-sidebar {
    width: 200px;
    background: #001529;
    border-radius: 6px;
    overflow: hidden;
}

.preview-logo-area {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-logo {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    object-fit: contain;
    background: rgba(255, 255, 255, 0.1);
}

.preview-logo-placeholder {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 18px;
}

.preview-title {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
}

.preview-menu {
    padding: 8px;
}

.preview-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    color: rgba(255, 255, 255, 0.65);
    border-radius: 6px;
    font-size: 13px;
    cursor: default;
    transition: all 0.2s;
}

.preview-menu-item.active {
    background: #1677ff;
    color: #fff;
}

:deep(.logo-uploader .ant-upload-list-item-container),
:deep(.logo-uploader .ant-upload.ant-upload-select) {
    width: 100px !important;
    height: 100px !important;
}
</style>
