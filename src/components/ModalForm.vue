 <template>
  <a-modal
    :title="title"
    :width="width"
    :open="open"
    :mask-closable="maskClosable"
    :keyboard="keyboard"
    :centered="centered"
    :destroy-on-close="destroyOnClose"
    @cancel="handleClose"
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

    <template #footer>
      <a-space>
        <a-button @click="handleClose">{{ cancelText }}</a-button>
        <a-button type="primary" @click="handleSubmit" :loading="loading">{{ okText }}</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, watch } from 'vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'

interface Props {
  /** 弹窗标题 */
  title?: string
  /** 弹窗宽度 */
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
  /** 点击蒙层是否允许关闭 */
  maskClosable?: boolean
  /** 是否支持键盘 ESC 关闭 */
  keyboard?: boolean
  /** 是否垂直居中 */
  centered?: boolean
  /** 关闭时销毁子元素 */
  destroyOnClose?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'update:modelValue', value: T): void
  (e: 'submit', value: T): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '表单',
  width: 520,
  labelAlign: 'right',
  labelCol: () => ({ span: 6 }),
  okText: '确定',
  cancelText: '取消',
  resetOnClose: false,
  maskClosable: false,
  keyboard: true,
  centered: false,
  destroyOnClose: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const formData = ref<T>({ ...props.modelValue } as T)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    formData.value = { ...newVal } as T
  },
  { deep: true }
)

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

/** 关闭弹窗 */
const handleClose = () => {
  // 清除表单验证状态
  formRef.value?.clearValidate()
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

/** 关闭弹窗 */
const close = () => {
  handleClose()
}

// 暴露方法给父组件
defineExpose({
  validate,
  validateFields,
  resetForm,
  clearValidate,
  setLoading,
  close
})
</script>

<style scoped>
:deep(.ant-form) {
  padding: 16px 24px 0;
}

:deep(.ant-form-item) {
  margin-bottom: 20px;
}

:deep(.ant-form-item:last-child) {
  margin-bottom: 8px;
}
</style>
