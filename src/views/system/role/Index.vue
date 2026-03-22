<template>
  <div class="page-container h-full">
    <SearchForm v-model="searchParams" :items="searchFieldItems" :loading="searchLoading" @search="onSearch"
      @reset="onReset">
    </SearchForm>
    <TableContainer ref="tableRef" :columns="columns" :request="getList" :showPager="true" showActionColumn
      :action-column-props="{ width: 200 }">
      <template #toolbar-left>
        <span class="mr-1 pl-1 text-[15px] font-bold">角色列表</span>
      </template>

      <template #toolbar-right>
        <div class="flex gap-2 m-2">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="onAdd">新增角色</a-button>
        </div>
      </template>

      <template #status="{ row }">
        <a-tag v-if="row.status === 1" color="green">启用</a-tag>
        <a-tag v-else color="red">禁用</a-tag>
      </template>

      <template #action="{ row }">
        <a-button type="link" size="small" @click="onEdit(row)">编辑</a-button>
        <a-button type="link" size="small" @click="onGrant(row)">授权</a-button>
        <a-button type="link" size="small" @click="onDetail(row.id)">详情</a-button>
        <a-button type="link" danger size="small" @click="onDelete(row)">删除</a-button>
      </template>


    </TableContainer>

    <!-- 新增/编辑角色弹窗 -->
    <RoleForm ref="roleFormRef" @success="onFormSuccess" />

    <!-- 角色授权抽屉 -->
    <GrantForm ref="grantFormRef" @success="onFormSuccess" />

    <!-- 角色详情抽屉 -->
    <RoleDetail ref="roleDetailRef" />
  </div>
</template>

<script setup lang="ts">
import { deleteRoleApi, getRoleListApi, type RoleVO } from "@/api/role";
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer, { type PageQuery } from '@/components/TableContainer.vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { Input, message, Modal, Select } from 'ant-design-vue';
import { h, ref } from 'vue';
import type { VxeGridPropTypes } from 'vxe-table';
import RoleForm from './components/RoleForm.vue';
import GrantForm from './components/GrantForm.vue';
import RoleDetail from './components/RoleDetail.vue';

interface SearchParams {
  name?: string | null;
}
const searchParams = ref<SearchParams>({});
const searchFieldItems: SearchFieldItem[] = [
  { label: "角色名称", field: "name", component: Input, componentProps: { placeholder: "请输入", allowClear: true } },
  { label: "角色编码", field: "code", component: Input, componentProps: { placeholder: "请输入", allowClear: true } },
  {
    label: "状态", field: "status", component: Select, componentProps: {
      placeholder: "请选择",
      allowClear: true,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    }
  },
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
  { field: 'name', title: '角色名称', width: 180 },
  { field: 'code', title: '角色编码', width: 180 },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'description', title: '描述' },
  { field: 'createTime', title: '创建时间', width: 180 },
]
const getList = async (pageQuery: PageQuery) => {
  const resp = await getRoleListApi({
    ...searchParams.value,
    ...pageQuery
  })
  return {
    result: resp.data.records,
    total: resp.data.total
  }
}
// 表单组件
const roleFormRef = ref<InstanceType<typeof RoleForm>>()
const grantFormRef = ref<InstanceType<typeof GrantForm>>()
const roleDetailRef = ref<InstanceType<typeof RoleDetail>>()

const onAdd = () => {
  roleFormRef.value?.add()
}
const onEdit = (row: RoleVO) => {
  roleFormRef.value?.edit(row)
}
const onDetail = (id: string) => {
  roleDetailRef.value?.show(id)
}

const onGrant = (row: RoleVO) => {
  grantFormRef.value?.show(row)
}
const onDelete = (row: RoleVO) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除角色「${row.name}」吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteRoleApi(row.id)
      message.success('删除成功')
      tableRef.value?.reload()
    }
  })
}
const onFormSuccess = () => {
  tableRef.value?.reload()
}
</script>

<style scoped></style>