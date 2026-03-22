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
      <a-form-item label="字典名称" name="name">
        <a-input v-model:value="form.name" placeholder="请输入字典名称" />
      </a-form-item>
      <a-form-item label="字典编码" name="code">
        <a-input v-model:value="form.code" placeholder="请输入字典编码" />
      </a-form-item>
      <a-form-item label="排序" name="sort">
        <a-input-number
          style="width: 100%"
          controls
          v-model:value="form.sort"
          :min="1"
          :max="999"
        />
      </a-form-item>
    </template>
  </ModalForm>
</template>

<script setup lang="ts">
import { addDataDictApi, updateDataDictApi, type DataDictForm, type DataDictVO } from '@/api/data-dict'
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
  const modalTitle = computed(() => (isEdit.value ? '编辑字典' : '新增字典'))

const initFormData = (): DataDictForm => ({
  name: '',
  code: '',
  sort: 999
})

const formData = ref<DataDictForm>(initFormData())

const formRules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入字典编码', trigger: 'blur' }]
}

/** 打开新增弹窗 */
const add = () => {
  isEdit.value = false
  formData.value = initFormData()
  open.value = true
}

/** 打开编辑弹窗 */
const edit = (row: DataDictVO) => {
  isEdit.value = true
  formData.value = {
    id: row.id,
    name: row.name,
    code: row.code,
    sort: row.sort
  }
  open.value = true
}

/** 提交表单 */
const handleSubmit = async (data: DataDictForm) => {
  try {
    modalFormRef.value?.setLoading(true)
    if (isEdit.value) {
      await updateDataDictApi(data)
      message.success('修改成功')
    } else {
      await addDataDictApi(data)
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
