<template>
  <a-drawer
    :title="title"
    :width="width"
    :open="open"
    :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }"
    @close="handleClose"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-align="labelAlign"
      :label-col="labelCol"
    >
      <slot :form="formData"></slot>
    </a-form>

    <template #extra>
      <a-space>
        <a-button @click="handleClose">{{ cancelText }}</a-button>
        <a-button type="primary" @click="handleSubmit" :loading="loading">{{ okText }}</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, watch } from 'vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'

interface Props {
  /** 抽屉标题 */
  title?: string
  /** 抽屉宽度 */
  width?: number | string
  /** 是否打开 */
  open: boolean
  /** 表单数据 */
  modelValue: T
  /** 表单验证规则 */
  rules?: Record<string, Rule[]>
  /** 标签对齐方式 */
  labelAlign?: 'left' | 'right'
  /** 标签布局 */
  labelCol?: { span?: number; offset?: number }
  /** 确认按钮文字 */
  okText?: string
  /** 取消按钮文字 */
  cancelText?: string
  /** 关闭时是否重置表单 */
  resetOnClose?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'update:modelValue', value: T): void
  (e: 'submit', value: T): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '表单',
  width: 730,
  labelAlign: 'right',
  labelCol: () => ({ span: 6 }),
  okText: '提交',
  cancelText: '取消',
  resetOnClose: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const formData = ref<T>({ ...props.modelValue } as T)

// 监听 modelValue 变化（仅在抽屉打开时不更新，避免覆盖用户输入）
// 抽屉打开时的初始化由下面的 open watch 处理

// 监听 open 变化
watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      formData.value = { ...props.modelValue } as T
    } else if (props.resetOnClose) {
      resetForm()
    }
  }
)

/** 关闭抽屉 */
const handleClose = () => {
   formRef.value?.resetFields()
  emit('update:open', false)
  emit('cancel')
}

/** 重置表单 */
const resetForm = () => {
  formRef.value?.resetFields()
}

/** 提交表单 */
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    emit('update:modelValue', formData.value)
    emit('submit', formData.value)
    
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

/** 设置加载状态（可通过 ref 调用） */
const setLoading = (value: boolean) => {
  loading.value = value
}

/** 手动验证表单 */
const validate = () => {
  return formRef.value?.validate()
}

/** 手动验证指定字段 */
const validateFields = (fields: string[]) => {
  return formRef.value?.validateFields(fields)
}

/** 清除验证 */
const clearValidate = (fields?: string[]) => {
  formRef.value?.clearValidate(fields)
}

// 暴露方法给父组件
defineExpose({
  formData,
  validate,
  validateFields,
  resetForm,
  clearValidate,
  setLoading
})
</script>

<style scoped></style>
