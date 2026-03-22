<template>
  <DrawerForm ref="drawerFormRef" v-model:open="open" v-model="formData" :title="drawerTitle" :rules="formRules"
    :label-col="{ span: 6 }" @submit="handleSubmit">
    <template #default="{ form }">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="用户名" name="username">
            <a-input v-model:value="form.username" placeholder="请输入用户名" :disabled="isEdit" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="昵称" name="nickname">
            <a-input v-model:value="form.nickname" placeholder="请输入昵称" />
          </a-form-item>
        </a-col>

        <a-col :span="12" v-if="!isEdit">
          <a-form-item label="初始密码" name="password">
            <a-input v-model:value="form.password" placeholder="请输入初始密码" type="password" :disabled="isEdit" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="角色" name="roleIds">
            <a-select v-model:value="form.roleIds" mode="multiple" placeholder="请选择角色" :options="roleOptions"
              :loading="roleLoading" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="手机号" name="phone">
            <a-input v-model:value="form.phone" placeholder="请输入手机号" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" name="status">
            <a-radio-group v-model:value="form.status">
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">禁用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="头像" name="avatar">
            <a-upload v-model:file-list="avatarFileList" list-type="picture-card" :max-count="1"
              :before-upload="beforeUpload" :custom-request="customUpload" @remove="handleRemoveAvatar">
              <div v-if="!form.avatar">
                <PlusOutlined />
                <div style="margin-top: 8px">上传</div>
              </div>
            </a-upload>
          </a-form-item>
        </a-col>
      </a-row>
    </template>
  </DrawerForm>
</template>

<script setup lang="ts">
import { uploadFileApi } from '@/api/file'
import { getRoleSelectListApi } from '@/api/role'
import { addUserApi, updateUserApi, type UserForm, type UserVO } from '@/api/user'
import DrawerForm from '@/components/DrawerForm.vue'
import { AES_KEY, FILE_ACCESS_URL } from '@/config/global'
import { aesCbcEncrypt } from '@/utils/AesGcmUtil'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message, type UploadFile, type UploadProps } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { computed, ref, watch } from 'vue'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const drawerFormRef = ref<{ formData: UserForm; setLoading: (v: boolean) => void } | null>(null)
const open = ref(false)
const isEdit = ref(false)
const drawerTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

// 角色选项原始数据
const roleList = ref<{ id: string; name: string; status: number }[]>([])
const roleLoading = ref(false)

// 角色选项（已选中的角色即使被禁用也可以取消选择）
const roleOptions = computed(() => {
  const selectedIds = formData.value.roleIds || []
  return roleList.value.map(item => ({
    label: item.name,
    value: item.id,
    disabled: item.status !== 1 && !selectedIds.includes(item.id)
  }))
})

// 头像上传
const avatarFileList = ref<UploadFile[]>([])

const initFormData = (): UserForm => ({
  username: '',
  nickname: '',
  phone: '',
  avatar: '',
  status: 1,
  roleIds: []
})

const formData = ref<UserForm>(initFormData())

// 监听 open 变化，同步头像到 fileList
watch(open, (newVal) => {
  if (newVal) {
    // 抽屉打开时，根据 formData 初始化头像预览
    const avatar = formData.value.avatar
    if (avatar) {
      avatarFileList.value = [{
        uid: '-1',
        name: 'avatar',
        status: 'done',
        url: FILE_ACCESS_URL + avatar
      }]
    } else {
      avatarFileList.value = []
    }
  }
})

// 上传前校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 自定义上传
const customUpload: UploadProps['customRequest'] = async (options) => {
  const { file, onSuccess, onError } = options
  try {
    const res = await uploadFileApi(file as File)
    // 直接更新 DrawerForm 内部的 formData，避免覆盖用户已输入的其他字段
    if (drawerFormRef.value?.formData) {
      drawerFormRef.value.formData.avatar = res.data.path
    }
    // 同步更新头像预览列表
    avatarFileList.value = [{
      uid: '-1',
      name: 'avatar',
      status: 'done',
      url: FILE_ACCESS_URL + res.data.path
    }]
    onSuccess?.({ url: res.data.url })
  } catch (error) {
    message.error('上传失败')
    onError?.(error as Error)
  }
}

// 移除头像
const handleRemoveAvatar = () => {
  if (drawerFormRef.value?.formData) {
    drawerFormRef.value.formData.avatar = ''
  }
  avatarFileList.value = []
}

const formRules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: [{ required: !isEdit.value, message: '请输入初始密码', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }]
}

// 加载角色列表
const loadRoleOptions = async () => {
  roleLoading.value = true
  try {
    const res = await getRoleSelectListApi()
    roleList.value = res.data
  } catch (error) {
    console.error('加载角色列表失败:', error)
  } finally {
    roleLoading.value = false
  }
}


/** 打开新增弹窗 */
const add = () => {
  isEdit.value = false
  formData.value = initFormData()
  loadRoleOptions()
  avatarFileList.value = []
  open.value = true
}

/** 打开编辑弹窗 */
const edit = (row: UserVO) => {
  loadRoleOptions()
  isEdit.value = true
  formData.value = {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    phone: row.phone,
    avatar: row.avatar,
    status: row.status,
    roleIds: row.roleIds || []
  }
  // 同步头像到 fileList
  if (row.avatar) {
    avatarFileList.value = [{
      uid: '-1',
      name: 'avatar',
      status: 'done',
      url: FILE_ACCESS_URL + row.avatar
    }]
  } else {
    avatarFileList.value = []
  }
  open.value = true
}

/** 提交表单 */
const handleSubmit = async (data: UserForm) => {
  try {
    drawerFormRef.value?.setLoading(true)
    if (isEdit.value) {
      await updateUserApi(data)
      message.success('修改成功')
    } else {
      // 密码AES加密
      const encrypted = aesCbcEncrypt(data.password!, AES_KEY)
      data.password = encrypted.data + ':' + encrypted.iv
      await addUserApi(data)
      message.success('新增成功')
    }
    open.value = false
    emit('success')
  } catch (error) {
    console.error(error)
  } finally {
    drawerFormRef.value?.setLoading(false)
  }
}

// 暴露方法给父组件
defineExpose({
  add,
  edit
})
</script>

<style scoped></style>
