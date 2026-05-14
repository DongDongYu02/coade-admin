<template>
  <div class="page-container h-full">
    <SearchForm
      v-model="searchParams"
      :items="searchFieldItems"
      :loading="searchLoading"
      @search="onSearch"
      @reset="onReset"
    />

    <TableContainer
      ref="tableRef"
      :columns="columns"
      :request="getList"
      :showPager="true"
      showActionColumn
      :page-size="10"
      :action-column-props="{ width: 160 }"
    >
      <template #toolbar-left>
        <span class="mr-1 pl-1 text-[15px] font-bold">区域保洁列表</span>
      </template>

      <template #toolbar-right>
        <div class="flex gap-2 m-2">
          <a-button type="primary" :icon="h(PlusOutlined)" @click="onAdd">新增区域</a-button>
        </div>
      </template>

      <template #principal="{ row }">
        <a-tag color="blue">{{ row.principalUserName || "-" }}</a-tag>
      </template>

      <template #action="{ row }">
        <a-button type="link" size="small" @click="onEdit(row)">编辑</a-button>
        <a-button type="link" danger size="small" @click="onDelete(row)">删除</a-button>
      </template>
    </TableContainer>

    <CleaningAreaForm ref="formRef" @success="onFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import {
  deleteCleaningAreaApi,
  getCleaningAreaListApi,
  type CmtCleaningAreaQuery,
  type CmtCleaningAreaVO
} from "@/api/cmt/cmt-cleaning";
import { getUserSelectionApi, type CmtUserSelectionVO } from "@/api/cmt/cmt-user";
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer, { type PageQuery } from "@/components/TableContainer.vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { Input, message, Modal, Select } from "ant-design-vue";
import { computed, h, onMounted, ref } from "vue";
import type { VxeGridPropTypes } from "vxe-table";
import CleaningAreaForm from "./components/CleaningAreaForm.vue";

const searchParams = ref<CmtCleaningAreaQuery>({});
const searchLoading = ref(false);
const tableRef = ref<InstanceType<typeof TableContainer>>();
const formRef = ref<InstanceType<typeof CleaningAreaForm>>();
const userOptions = ref<CmtUserSelectionVO[]>([]);

const searchFieldItems = computed<SearchFieldItem[]>(() => [
  {
    label: "区域名称",
    field: "name",
    component: Input,
    componentProps: {
      placeholder: "请输入",
      allowClear: true
    }
  },
  {
    label: "负责人",
    field: "principalUserId",
    component: Select,
    componentProps: {
      placeholder: "请选择",
      allowClear: true,
      showSearch: true,
      optionFilterProp: "label",
      options: userOptions.value.map((item) => ({
        label: item.name || item.ekpId || item.id,
        value: item.id
      }))
    }
  }
]);

const columns: VxeGridPropTypes.Columns<CmtCleaningAreaVO> = [
  { field: "name", title: "区域名称", width: 220 },
  { field: "principalUserName", title: "负责人", width: 160, slots: { default: "principal" } },
  { field: "rule", title: "规则", width: 260 },
  { field: "remark", title: "备注"},
  { field: "createTime", title: "创建时间", width: 180 }
];

const loadUserOptions = async () => {
  const resp = await getUserSelectionApi();
  userOptions.value = resp.data || [];
};

const onSearch = async () => {
  tableRef.value?.resetPager();
  tableRef.value?.reload();
};

const onReset = async () => {
  searchParams.value = {};
  tableRef.value?.resetPager();
  tableRef.value?.reload();
};

const getList = async (pageQuery: PageQuery) => {
  const resp = await getCleaningAreaListApi({
    ...searchParams.value,
    ...pageQuery
  });

  return {
    result: resp.data.records,
    total: resp.data.total
  };
};

const onAdd = () => {
  formRef.value?.add();
};

const onEdit = (row: CmtCleaningAreaVO) => {
  formRef.value?.edit(row);
};

const onDelete = (row: CmtCleaningAreaVO) => {
  Modal.confirm({
    title: "确认删除",
    content: `确定要删除「${row.name || "-"}」吗？`,
    okText: "确定",
    cancelText: "取消",
    onOk: async () => {
      await deleteCleaningAreaApi(row.id);
      message.success("删除成功");
      tableRef.value?.reload();
    }
  });
};

const onFormSuccess = () => {
  tableRef.value?.reload();
};

onMounted(() => {
  loadUserOptions();
});
</script>

<style scoped></style>
