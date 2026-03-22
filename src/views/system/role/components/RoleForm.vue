<template>
  <ModalForm
    ref="modalFormRef"
    v-model:open="open"
    v-model="formData"
    :title="modalTitle"
    :rules="formRules"
    :label-col="{ span: 4 }"
    @submit="handleSubmit"
  >
    <template #default="{ form }">
      <a-form-item label="角色名称" name="name">
        <a-input v-model:value="form.name" placeholder="请输入角色名称" />
      </a-form-item>
      <a-form-item label="角色编码" name="code">
        <a-input v-model:value="form.code" placeholder="请输入角色编码" />
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="form.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="描述" name="description">
        <a-textarea v-model:value="form.description" placeholder="请输入角色描述" :rows="3" />
      </a-form-item>
    </template>
  </ModalForm>
</template>

<script setup lang="ts">
import { addRoleApi, updateRoleApi, type RoleForm, type RoleVO } from '@/api/role'
import ModalForm from '@/components/ModalForm.vue'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { computed, ref, type ComponentPublicInstance } from 'vue'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const modalFormRef = ref<ComponentPublicInstance<{ setLoading: (loading: boolean) => void }> | null>(null)
const open = ref(false)
const isEdit = ref(false)
const modalTitle = computed(() => (isEdit.value ? '编辑角色' : '新增角色'))

const initFormData = (): RoleForm => ({
  name: '',
  code: '',
  status: 1,
  description: ''
})

const formData = ref<RoleForm>(initFormData())

const formRules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

/** 打开新增弹窗 */
const add = () => {
  isEdit.value = false
  formData.value = initFormData()
  open.value = true
}

/** 打开编辑弹窗 */
const edit = (row: RoleVO) => {
  isEdit.value = true
  formData.value = {
    id: row.id,
    name: row.name,
    code: row.code,
    status: row.status,
    description: row.description
  }
  open.value = true
}

/** 提交表单 */
const handleSubmit = async (data: RoleForm) => {
  try {
    modalFormRef.value?.setLoading(true)
    if (isEdit.value) {
      await updateRoleApi(data)
      message.success('修改成功')
    } else {
      await addRoleApi(data)
      message.success('新增成功')
    }
    open.value = false
    emit('success')
  } catch (error) {
    console.error(error)
  } finally {
    modalFormRef.value?.setLoading(false)
  }
}

// 暴露方法给父组件
defineExpose({
  add,
  edit
})
</script>

<style scoped></style>
