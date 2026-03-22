<template>
  <DrawerForm :title="isEdit ? '编辑权限' : '新增权限'" :width="720" :open="open" @update:open="emit('update:open', $event)"
    :model-value="form" :rules="rules" @submit="handleSubmit">
    <template #default="{ form: formData }">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="类型" name="type">
            <a-radio-group v-model:value="formData.type" button-style="solid">
              <a-radio-button :value="1">目录</a-radio-button>
              <a-radio-button :value="2">菜单</a-radio-button>
              <a-radio-button :value="3">按钮</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">

        <a-col :span="12">
          <a-form-item label="名称" name="name">
            <a-input v-model:value="formData.name" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="formData.type === 3 ? '上级菜单' : '上级目录'" name="pid">
            <a-tree-select v-model:value="formData.pid" placeholder="请选择" :tree-data="permissionTreeSelection"
              tree-default-expand-all show-search allow-clear
              :fieldNames="{ children: 'children', label: 'name', value: 'id' }" />
          </a-form-item>
        </a-col>
        <a-col v-if="formData.type !== 3" :span="12">
          <a-form-item label="路由地址" name="path">
            <a-input v-model:value="formData.path" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
        <a-col v-if="formData.type !== 3" :span="12">
          <a-form-item label="图标" name="icon">
            <IconPicker v-model:value="formData.icon" />
          </a-form-item>
        </a-col>
        <a-col v-if="formData.type === 2" :span="12">
          <a-form-item label="页面组件" name="component">
            <a-input v-model:value="formData.component" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
        <a-col v-if="formData.type === 3" :span="12">
          <a-form-item label="权限标识" name="authCode">
            <a-input v-model:value="formData.authCode" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col v-if="formData.type === 1" :span="12">
          <a-form-item label="重定向" name="redirect">
            <a-input v-model:value="formData.redirect" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="排序" name="sort">
            <a-input-number style="width: 100%" controls v-model:value="formData.sort" :min="1" :max="999" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" name="status">
            <a-switch v-model:checked="formData.status" checked-children="启用" un-checked-children="禁用" />
          </a-form-item>
        </a-col>
      </a-row>
      <!-- 其他设置 - 按钮类型隐藏 -->
      <template v-if="formData.type !== 3">
        <a-row :gutter="16">
          <a-divider style="border-color: #d9d9d9; color: #4b4e51">其他设置</a-divider>
        </a-row>
        <div class="flex justify-between pl-20 pr-20">
          <!-- 目录类型 -->
          <template v-if="formData.type === 1">
            <a-checkbox v-model:checked="formData.hidden">隐藏目录</a-checkbox>
          </template>
          <!-- 菜单类型 -->
          <template v-if="formData.type === 2">
            <div class="flex flex-col gap-2">
              <a-checkbox v-model:checked="formData.keepAlive">缓存标签页</a-checkbox>
              <a-checkbox v-model:checked="formData.hidden">隐藏菜单</a-checkbox>
            </div>
            <div class="flex flex-col">
              <a-checkbox v-model:checked="formData.affix">固定在标签栏</a-checkbox>
            </div>
          </template>
        </div>
      </template>
    </template>
  </DrawerForm>
</template>

<script setup lang="ts">
import { getPermissionTreeSelectApi, type PermissionTreeSelectVO, type PermissionVO } from '@/api/permission'
import DrawerForm from '@/components/DrawerForm.vue'
import IconPicker from '@/components/icon/IconPicker.vue'
import type { Rule } from 'ant-design-vue/es/form'
import { computed, reactive, ref, watch } from 'vue'

export interface PermissionForm {
  pid: string | null
  authCode: string
  name: string
  icon: string
  path: string
  redirect: string
  component: string
  affix: boolean
  status: boolean
  sort: number
  type: number
  keepAlive: boolean
  hidden: boolean
}

const props = defineProps<{
  open: boolean
  record?: PermissionVO | null
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'submit', v: PermissionForm): void
}>()

const isEdit = computed(() => !!props.record?.id)


const getDefaultForm = (): PermissionForm => ({
  pid: null,
  authCode: '',
  name: '',
  icon: '',
  path: '',
  redirect: '',
  component: '',
  affix: false,
  status: true,
  sort: 999,
  type: 1,
  keepAlive: true,
  hidden: false
})

const form = reactive<PermissionForm>(getDefaultForm())
const permissionTreeSelection = ref<PermissionTreeSelectVO[]>([]);

// 监听 record 变化，填充表单
watch(() => props.record, (val) => {
  if (val?.id) {
    // 编辑模式：填充数据
    form.pid = val.pid || null
    form.authCode = val.authCode || ''
    form.name = val.name || ''
    form.icon = val.icon || ''
    form.path = val.path || ''
    form.redirect = val.redirect || ''
    form.component = val.component || ''
    form.affix = val.affix === 1
    form.status = val.status === 1
    form.sort = val.sort || 999
    form.type = val.type || 1
    form.keepAlive = val.keepAlive === 1
    form.hidden = val.hidden === 1
  } else {
    // 新增模式
    const defaults = getDefaultForm()
    Object.assign(form, defaults, {
      pid: val?.pid || null,
      type: val?.type || defaults.type
    })
  }
}, { immediate: true })

// 动态验证规则
const rules = computed<Record<string, Rule[]>>(() => {
  const baseRules: Record<string, Rule[]> = {
    name: [{ required: true, message: '请输入名称' }],
    type: [{ required: true, message: '请选择权限类型' }],
  }

  if (form.type === 1) {
    // 目录类型
    return {
      ...baseRules,
      path: [{ required: true, message: '请输入路由地址' }],
      redirect: [{ required: true, message: '请输入重定向地址' }],
    }
  } else if (form.type === 2) {
    // 菜单类型
    return {
      ...baseRules,
      path: [{ required: true, message: '请输入路由地址' }],
      component: [{ required: true, message: '请输入页面组件' }],
    }
  } else {
    // 按钮类型
    return {
      ...baseRules,
      pid: [{ required: true, message: '请选择上级菜单' }],
      authCode: [{ required: true, message: '请输入权限标识' }],
    }
  }
})
const getPermissionTreeSelect = async (includeTypes: number[]) => {
  const resp = await getPermissionTreeSelectApi({ includeTypes });
  permissionTreeSelection.value = resp.data;
}

const handleSubmit = (values: PermissionForm) => {
  emit('submit', values)
}

getPermissionTreeSelect([1, 2]);

</script>

<style scoped></style>
