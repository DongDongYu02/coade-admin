<template>
  <div class="page-container user-index h-full">
    <SearchForm v-model="searchParams" :items="searchFieldItems" :loading="searchLoading" @search="onSearch"
      @reset="onReset">
    </SearchForm>
    <TableContainer ref="tableRef" :columns="columns" :request="getList" :showPager="true" showActionColumn
      :action-column-props="{ width: 220 }">
      <template #toolbar-left>
        <span class="mr-1 pl-1 text-[15px] font-bold">用户列表</span>
      </template>

      <template #toolbar-right>
        <div class="flex gap-2 m-2">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="onAdd">新增用户</a-button>
        </div>
      </template>

      <template #avatar="{ row }">
        <a-image v-if="row.avatar" :src="FILE_ACCESS_URL + row.avatar" :width="36" :height="36"
          style="border-radius: 50%; object-fit: contain; cursor: pointer;" :preview="{ mask: true }" />
        <a-avatar v-else shape="circle" :size="36" alt="User">
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </template>

      <template #roles="{ row }">
        <a-tag v-for="role in row.roleNames" :key="role" color="pink">{{ role }}</a-tag>
      </template>

      <template #status="{ row }">
        <a-tag v-if="row.status === 1" color="green">启用</a-tag>
        <a-tag v-else color="red">禁用</a-tag>
      </template>

      <template #action="{ row }">
        <a-button v-permission="'sys:user:edit'" type="link" size="small" @click="onEdit(row)">编辑</a-button>
        <a-button type="link" size="small" @click="onDetail(row.id)">详情</a-button>
        <a-button v-permission="'sys:user:resetpwd'" type="link" size="small" @click="onResetPassword(row.id)">重置密码</a-button>
        <a-button v-permission="'sys:user:delete'" type="link" danger size="small" @click="onDelete(row)">删除</a-button>
      </template>


    </TableContainer>

    <UserForm ref="userFormRef" @success="onFormSuccess" />

    <UserDetail ref="userDetailRef" />
  </div>
</template>

<script setup lang="ts">
import { deleteUserApi, getUserListApi, resetUserPasswordApi, type UserVO } from "@/api/user";
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer, { type PageQuery } from '@/components/TableContainer.vue';
import { PlusOutlined, UserOutlined } from '@ant-design/icons-vue';
import { Input, message, Modal, Select } from 'ant-design-vue';
import { h, ref } from 'vue';
import type { VxeGridPropTypes } from 'vxe-table';
import UserDetail from "./components/UserDetail.vue";
import UserForm from "./components/UserForm.vue";

const FILE_ACCESS_URL = window.location.origin + import.meta.env.VITE_FILE_ACCESS_PATH_PREFIX
interface SearchParams {
  name?: string | null;
  nickname?: string | null;
  phone?: string | null;
  status?: number | null;
}
const searchParams = ref<SearchParams>({});
const searchFieldItems: SearchFieldItem[] = [
  { label: "用户名", field: "username", component: Input, componentProps: { placeholder: "请输入", allowClear: true } },
  { label: "昵称", field: "nickname", component: Input, componentProps: { placeholder: "请输入", allowClear: true } },
  { label: "手机号", field: "phone", component: Input, componentProps: { placeholder: "请输入", allowClear: true } },
  {
    label: "状态", field: "status", component: Select, componentProps: {
      placeholder: "请选择",
      allowClear: true,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    }
  }
];
const searchLoading = ref(false);
const onSearch = async () => {
  tableRef.value?.reload()
}
const onReset = async () => {
  searchParams.value = {}
  tableRef.value?.reload()
}

const tableRef = ref<InstanceType<typeof TableContainer>>()
const columns: VxeGridPropTypes.Columns<any> = [
  { field: 'avatar', title: '头像', width: 50, slots: { default: 'avatar' } },
  { field: 'username', title: '用户名', width: 180 },
  { field: 'nickname', title: '昵称', width: 180 },
  { field: 'phone', title: '手机号', width: 180 },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'roles', title: '角色', slots: { default: 'roles' } },
  { field: 'createTime', title: '创建时间', width: 180 },
]
const getList = async (pageQuery: PageQuery) => {
  const resp = await getUserListApi({
    ...searchParams.value,
    ...pageQuery
  })
  return {
    result: resp.data.records,
    total: resp.data.total
  }
}
// 表单组件
const userFormRef = ref<InstanceType<typeof UserForm>>()
const userDetailRef = ref<InstanceType<typeof UserDetail>>()

const onAdd = () => {
  userFormRef.value?.add()
}
const onEdit = (row: UserVO) => {
  userFormRef.value?.edit(row)
}
const onDetail = (id: string) => {
  userDetailRef.value?.show(id)
}
const onDelete = (row: UserVO) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户「${row.nickname}」吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteUserApi(row.id)
      message.success('删除成功')
      tableRef.value?.reload()
    }
  })
}

const onResetPassword = (id: string) => {
  Modal.confirm({
    title: '确认重置密码',
    content: '确定要重置该用户的密码吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const res = await resetUserPasswordApi(id)
      Modal.success({
        title: '密码重置成功',
        content: h('div', [
          h('span', '新密码为：'),
          h('span', { style: { fontWeight: 'bold', fontSize: '16px', color: '#1890ff', userSelect: 'all' } }, res.data)
        ])
      })
    }
  })
}

const onFormSuccess = () => {
  tableRef.value?.reload()
}
</script>

<style scoped>
:deep(.ant-image) {
  display: block !important;
}
</style>