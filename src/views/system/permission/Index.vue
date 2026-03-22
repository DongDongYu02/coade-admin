<template>
  <div class="page-container h-full">
    <SearchForm v-model="searchParams" :items="items" :loading="loading" @search="onSearch" @reset="onReset">
    </SearchForm>
    <TableContainer ref="tableRef" :columns="columns" :request="getList" :showPager="false" showActionColumn
      :action-column-props="{ width: 220 }" :gridProps="{ treeConfig: treeConfig }">
      <template #toolbar-left>
        <span class="mr-1 pl-1 text-[15px] font-bold">权限列表</span>
      </template>

      <template #toolbar-right="{ hasSelection, getSelectedRecords }">
        <div class="flex gap-2 m-2">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="onAdd">新增权限</a-button>
          <a-button v-if="hasSelection" type="primary" danger :icon="h(DeleteOutlined)"
            @click="console.table(getSelectedRecords())">
            删除选中项
          </a-button>
        </div>
      </template>
      <template #typeSlot="{ row }">
        <a-tag v-if="row.type === 1" color="blue">目录</a-tag>
        <a-tag v-else-if="row.type === 2" color="green">菜单</a-tag>
        <a-tag v-else color="pink">按钮</a-tag>
      </template>
      <template #iconSlot="{ row }">
        <DynamicIcon :name="row.icon" />
      </template>
      <template #statusSlot="{ row }">
        <a-switch :checked="row.status === 1" checked-children="启用" un-checked-children="禁用"
          :loading="statusSwitchLoading" @click="(checked: boolean) => onStatusSwitchClick(checked, row)" />
      </template>
      <template #action="{ row }">
        <a-button type="link" size="small" @click="onAddSub(row)">添加下级</a-button>
        <a-button type="link" size="small" @click="onEdit(row)">编辑</a-button>
        <a-button type="link" size="small" @click="onDetail(row.id)">详情</a-button>
        <a-button type="link" danger size="small" @click="onDelete(row)">删除</a-button>
      </template>
    </TableContainer>
    <FormModel v-model:open="drawerOpen" :record="currentRecord" @submit="handleSubmit" />
    <DetailModel v-model:open="detailOpen" :data="detailData" />
  </div>


</template>

<script setup lang="ts">
import { createPermissionApi, deletePermissionApi, getPermissionTreeApi, updatePermissionApi, updatePermissionStatusApi, type PermissionDTO, type PermissionVO } from "@/api/permission";
import DynamicIcon from '@/components/icon/DynamicIcon.vue';
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer from '@/components/TableContainer.vue';
import { DeleteOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { Input, message, Modal } from "ant-design-vue";
import { computed, h, ref } from "vue";
import { type VxeGridPropTypes, type VxeTablePropTypes } from "vxe-table";
import DetailModel from "./model/DetailModel.vue";
import FormModel, { type PermissionForm } from "./model/FormModel.vue";


// 表格组件引用
const tableRef = ref<InstanceType<typeof TableContainer>>()

interface SearchParams {
  name?: string | null;
}
const loading = ref(false);
const statusSwitchLoading = ref(false);

const searchParams = ref<SearchParams>({});

const rootKeys = ref<string[]>([]);


// 这里用computed是为了响应式更新展开节点
const treeConfig = computed<VxeTablePropTypes.TreeConfig>(() => ({
  transform: true,
  rowField: 'id',
  parentField: 'pid',
  expandRowKeys: rootKeys.value,
}))

const columns: VxeGridPropTypes.Columns<any> = [
  { field: 'name', title: '权限名称', treeNode: true },
  { field: 'type', title: '权限类型', slots: { default: 'typeSlot' } },
  { field: 'icon', title: '图标', slots: { default: 'iconSlot' } },
  { field: 'path', title: '路由地址' },
  { field: 'component', title: '组件路径' },
  { field: 'redirect', title: '重定向地址' },
  { field: 'authCode', title: '权限标识' },
  { field: 'status', title: '状态', slots: { default: 'statusSlot' } },
  { field: 'sort', title: '排序' }
]

const items: SearchFieldItem[] = [
  { label: "权限名称", field: "name", component: Input, componentProps: { placeholder: "请输入", allowClear: true } },

];



// 展开根节点
const expandRootNodes = async () => {
  const grid = tableRef.value?.gridRef
  if (grid && rootKeys.value.length > 0) {
    const rows = rootKeys.value.map(id => grid.getRowById(id)).filter(Boolean)
    await grid.setTreeExpand(rows, true)
  }
}

const onSearch = async () => {
  loading.value = true
  await tableRef.value?.reload()
  await expandRootNodes()
  loading.value = false
}

const onReset = async () => {
  searchParams.value = {}
  await tableRef.value?.reload()
  await expandRootNodes()
}

const getList = async () => {
  // 将搜索参数传递给 API
  const resp = await getPermissionTreeApi(searchParams.value);
  rootKeys.value = resp.data.filter(item => item.pid === '0').map(item => item.id);

  return {
    result: resp.data,
    total: 0
  }
}

const onStatusSwitchClick = async (checked: boolean, row: PermissionVO) => {
  statusSwitchLoading.value = true;
  await updatePermissionStatusApi({
    id: row.id,
    status: checked ? 1 : 0
  });
  message.success("操作成功！");
  statusSwitchLoading.value = false;
  onReset();
}



const drawerOpen = ref(false);
const currentRecord = ref<PermissionVO | null>(null);

// 新增
const onAdd = () => {
  currentRecord.value = null
  drawerOpen.value = true
}

// 编辑
const onEdit = (row: PermissionVO) => {
  currentRecord.value = row
  drawerOpen.value = true
}

// 添加下级
const onAddSub = (row: PermissionVO) => {
  currentRecord.value = {
    pid: row.id,
    type: 2
  } as PermissionVO
  drawerOpen.value = true
}

// 删除
const onDelete = (row: PermissionVO) => {
  Modal.confirm({
    title: '确认删除',
    icon: h(ExclamationCircleOutlined),
    content: `确定要删除「${row.name}」吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      return deletePermissionApi(row.id)
        .then(async () => {
          message.success("删除成功！")
          await tableRef.value?.reload()
          expandRootNodes()
        })
        .catch(() => {
        })
    }
  })
}

// 详情
const detailOpen = ref(false)
const detailData = ref({});
const onDetail = (id: string) => {
  detailData.value = { id: id }
  detailOpen.value = true
}

const handleSubmit = async (form: PermissionForm) => {
  const data = {
    ...form,
    affix: form.affix ? 1 : 0,
    status: form.status ? 1 : 0,
    keepAlive: form.keepAlive ? 1 : 0,
    hidden: form.hidden ? 1 : 0,
  } as PermissionDTO;

  if (currentRecord.value?.id) {
    // 编辑
    data.id = currentRecord.value.id;
    await updatePermissionApi(data);
    message.success("编辑成功！");
  } else {
    // 新增
    await createPermissionApi(data);
    message.success("新增成功！");
  }

  drawerOpen.value = false;
  await tableRef.value?.reload()
  expandRootNodes();
};
</script>
