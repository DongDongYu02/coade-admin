<template>
  <div class="page-container user-index h-full">
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
      :page-size="50"
      showActionColumn
      :action-column-props="{ width: 100 }"
    >
      <template #toolbar-left>
        <span class="mr-1 pl-1 text-[15px] font-bold">整改记录列表</span>
      </template>

      <template #status="{ row }">
        <a-tag :color="STATUS_COLOR_MAP[row.status] || 'default'">
          {{ STATUS_TEXT_MAP[row.status] || "-" }}
        </a-tag>
      </template>

      <template #action="{ row }">
        <a-button type="link" size="small" @click="onDetail(row.id)">详情</a-button>
      </template>
    </TableContainer>

    <RectifyDetail v-model:open="detailOpen" :data="detailData" />
  </div>
</template>

<script setup lang="ts">
import { get6sReviewListApi } from "@/api/cmt/cmt-6s";
import { getDeptSelectionApi, type CmtDeptSelectionVO } from "@/api/cmt/cmt-dept";
import { getUserSelectionApi, type CmtUserSelectionVO } from "@/api/cmt/cmt-user";
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer, { type PageQuery } from "@/components/TableContainer.vue";
import zhCN from "ant-design-vue/es/date-picker/locale/zh_CN";
import { DatePicker, Select } from "ant-design-vue";
import { computed, onMounted, ref } from "vue";
import type { VxeGridPropTypes } from "vxe-table";
import RectifyDetail from "./components/RectifyDetail.vue";

interface SearchParams {
  deptId?: string | null;
  responsiblePersonId?: string | null;
  status?: number | null;
  createTimeRange?: string[] | null;
}

const STATUS_TEXT_MAP: Record<number, string> = {
  0: "分析中",
  1: "分析完成",
  2: "待整改",
  3: "整改完成",
  4: "分析失败"
};

const STATUS_COLOR_MAP: Record<number, string> = {
  0: "processing",
  1: "blue",
  2: "warning",
  3: "success",
  4: "error"
};

const DATE_RANGE_FORMAT = "YYYY-MM-DD";

const searchParams = ref<SearchParams>({});
const searchLoading = ref(false);
const tableRef = ref<InstanceType<typeof TableContainer>>();
const detailOpen = ref(false);
const detailData = ref<{ id?: string }>({});
const deptOptions = ref<CmtDeptSelectionVO[]>([]);
const userOptions = ref<CmtUserSelectionVO[]>([]);

const searchFieldItems = computed<SearchFieldItem[]>(() => [
  {
    label: "负责人",
    field: "responsiblePersonId",
    component: Select,
    componentProps: {
      placeholder: "请选择",
      allowClear: true,
      showSearch: true,
      optionFilterProp: "label",
      options: userOptions.value
        .filter((item) => item.ekpId)
        .map((item) => ({
          label: item.name || item.ekpId,
          value: item.ekpId
        }))
    }
  },
  {
    label: "部门",
    field: "deptId",
    component: Select,
    componentProps: {
      placeholder: "请选择",
      allowClear: true,
      showSearch: true,
      optionFilterProp: "label",
      options: deptOptions.value.map((item) => ({
        label: item.text,
        value: item.id
      }))
    }
  },
  {
    label: "状态",
    field: "status",
    component: Select,
    componentProps: {
      placeholder: "请选择",
      allowClear: true,
      options: Object.entries(STATUS_TEXT_MAP).map(([value, label]) => ({
        label,
        value: Number(value)
      }))
    }
  },
  {
    label: "创建时间",
    field: "createTimeRange",
    component: DatePicker.RangePicker,
    formItemProps: {
      class: "search-time-range"
    },
    componentProps: {
      allowClear: true,
      locale: zhCN,
      format: DATE_RANGE_FORMAT,
      valueFormat: DATE_RANGE_FORMAT,
      placeholder: ["开始日期", "结束日期"]
    }
  }
]);

const columns: VxeGridPropTypes.Columns<any> = [
  { field: "title", title: "标题", width: 500 },
  { field: "deptName", title: "部门", width: 180 },
  { field: "responsiblePersonName", title: "负责人", width: 180 },
  { field: "status", title: "状态", minWidth: 120, slots: { default: "status" } },
  { field: "creator", title: "提交人", width: 140 },
  { field: "createTime", title: "创建时间", width: 180 }
];

const buildQueryParams = (pageQuery?: PageQuery) => {
  const createTimeRange = Array.isArray(searchParams.value.createTimeRange)
    ? searchParams.value.createTimeRange.filter(Boolean).join(",")
    : undefined;

  return {
    deptId: searchParams.value.deptId,
    responsiblePersonId: searchParams.value.responsiblePersonId,
    status: searchParams.value.status,
    createTimeRange,
    ...pageQuery
  };
};

const loadDeptOptions = async () => {
  const resp = await getDeptSelectionApi();
  deptOptions.value = resp.data || [];
};

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

const onDetail = (id: string) => {
  detailData.value = { id };
  detailOpen.value = true;
};

const getList = async (pageQuery: PageQuery) => {
  const resp = await get6sReviewListApi(buildQueryParams(pageQuery));

  return {
    result: resp.data.records,
    total: resp.data.total
  };
};

onMounted(async () => {
  await Promise.allSettled([loadDeptOptions(), loadUserOptions()]);
});
</script>

<style scoped>
:deep(.search-time-range.search-field-item) {
  min-width: 400px;
  max-width: 400px;
}

:deep(.search-time-range .ant-form-item-control-input-content) {
  width: 240px;
}

:deep(.search-time-range .ant-picker) {
  width: 100%;
}
</style>
