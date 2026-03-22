<template>
  <div class="page-container h-full">
    <SearchForm
      v-model="searchParams"
      :items="searchFieldItems"
      :loading="searchLoading"
      @search="onSearch"
      @reset="onReset"
    >
    </SearchForm>
    <TableContainer
      ref="tableRef"
      :columns="columns"
      :request="getList"
      :showPager="true"
      showActionColumn
      :action-column-props="{ width: 160 }"
    >
      <template #toolbar-left>
        <span class="mr-1 pl-1 text-[15px] font-bold">数据字典列表</span>
      </template>

      <template #toolbar-right>
        <div class="flex gap-2 m-2">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="onAdd"
            >新增字典</a-button
          >
        </div>
      </template>

      <template #action="{ row }">
        <a-button type="link" size="small" @click="onShowItems(row.id)">字典项</a-button>
        <a-button type="link" size="small" @click="onEdit(row)">编辑</a-button>
        <a-button type="link" danger size="small" @click="onDelete(row)">删除</a-button>
      </template>
    </TableContainer>

    <!-- 新增/编辑弹窗 -->
    <DataDictForm ref="formRef" @success="onFormSuccess" />

    <!-- 字典项抽屉 -->
    <DictItemDrawer ref="dictItemDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import { deleteDataDictApi, getDataDictListApi, type DataDictVO } from "@/api/data-dict";
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer, { type PageQuery } from '@/components/TableContainer.vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { Input, message, Modal } from 'ant-design-vue';
import { h, ref } from 'vue';
import type { VxeGridPropTypes } from 'vxe-table';
import DataDictForm from "./components/DataDictForm.vue";
import DictItemDrawer from "./components/DictItemDrawer.vue";

interface SearchParams {
  name?: string | null;
  code?: string | null;
}
const searchParams = ref<SearchParams>({});
const searchFieldItems: SearchFieldItem[] = [
  { label: "字典名称", field: "name", component: Input, componentProps: { placeholder: "请输入", allowClear: true } },
  { label: "字典编码", field: "code", component: Input, componentProps: { placeholder: "请输入", allowClear: true } }
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
  { field: 'name', title: '字典名称', width: 180 },
  { field: 'code', title: '字典编码' },
  { field: 'sort', title: '排序', width: 100 },
  { field: 'createTime', title: '创建时间', width: 180 },
]
const getList = async (pageQuery: PageQuery) => {
  const resp = await getDataDictListApi({
    ...searchParams.value,
    ...pageQuery
  })
  return {
    result: resp.data.records,
    total: resp.data.total
  }
}
// 表单组件
const formRef = ref<InstanceType<typeof DataDictForm>>()
const dictItemDrawerRef = ref<InstanceType<typeof DictItemDrawer>>()

const onAdd = () => {
  formRef.value?.add()
}
const onEdit = (row: DataDictVO) => {
  formRef.value?.edit(row)
}
const onShowItems = (id: string) => {
  dictItemDrawerRef.value?.show(id)
}

const onDelete = (row: DataDictVO) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除数据字典「${row.name}」吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteDataDictApi(row.id)
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
