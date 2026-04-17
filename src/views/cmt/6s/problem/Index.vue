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
    >
      <template #toolbar-left>
        <span class="mr-1 pl-1 text-[15px] font-bold">问题记录列表</span>
      </template>

      <template #toolbar-right>
        <div class="flex gap-2 m-2">
          <a-button :loading="exportLoading" @click="onOpenExportRecord">导出记录</a-button>
          <a-button type="primary" :loading="exportLoading" @click="onExport">导出</a-button>
        </div>
      </template>

      <template #problemImage="{ row }">
        <div class="image-cell">
          <a-image
            v-if="resolveImageUrl(row.problemImage)"
            :src="resolveImageUrl(row.problemImage)"
            :width="56"
            :height="56"
            class="table-image"
          />
          <span v-else>-</span>
        </div>
      </template>

      <template #rectifyImage="{ row }">
        <div class="image-cell">
          <a-image
            v-if="resolveImageUrl(row.rectifyImage)"
            :src="resolveImageUrl(row.rectifyImage)"
            :width="56"
            :height="56"
            class="table-image"
          />
          <span v-else>-</span>
        </div>
      </template>

      <template #status="{ row }">
        <a-tag :color="STATUS_COLOR_MAP[row.status] || 'default'">
          {{ STATUS_TEXT_MAP[row.status] || "-" }}
        </a-tag>
      </template>
    </TableContainer>

    <ExportRecordModal
      v-model:open="exportRecordOpen"
      :records="exportRecords"
      :loading="exportRecordLoading"
      @refresh="loadExportRecords"
    />
  </div>
</template>

<script setup lang="ts">
import {
  export6sProblemsApi,
  get6sProblemExportRecordListApi,
  get6sProblemPageListApi,
  type Cmt6sProblemExportRecordVO,
  type Cmt6sReviewProblemVO
} from "@/api/cmt/cmt-6s";
import { getDeptSelectionApi, type CmtDeptSelectionVO } from "@/api/cmt/cmt-dept";
import { getUserSelectionApi, type CmtUserSelectionVO } from "@/api/cmt/cmt-user";
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer, { type PageQuery } from "@/components/TableContainer.vue";
import zhCN from "ant-design-vue/es/date-picker/locale/zh_CN";
import { DatePicker, message, Select } from "ant-design-vue";
import { computed, onMounted, ref } from "vue";
import type { VxeGridPropTypes } from "vxe-table";
import ExportRecordModal from "./components/ExportRecordModal.vue";

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
  3: "已完成"
};

const STATUS_COLOR_MAP: Record<number, string> = {
  0: "processing",
  1: "blue",
  2: "warning",
  3: "success"
};

const DATE_RANGE_FORMAT = "YYYY-MM-DD";
const FILE_ACCESS_URL = window.location.origin + import.meta.env.VITE_FILE_ACCESS_PATH_PREFIX;

const searchParams = ref<SearchParams>({});
const searchLoading = ref(false);
const exportLoading = ref(false);
const exportRecordOpen = ref(false);
const exportRecordLoading = ref(false);
const exportRecords = ref<Cmt6sProblemExportRecordVO[]>([]);
const tableRef = ref<InstanceType<typeof TableContainer>>();
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
  { field: "deptName", title: "部门", width: 160 },
  { field: "description", title: "问题描述", minWidth: 500 },
  { field: "suggestion", title: "整改建议", minWidth: 500 },
  { field: "problemImage", title: "问题图片", width: 92, slots: { default: "problemImage" } },
  { field: "rectifyImage", title: "整改图片", width: 92, slots: { default: "rectifyImage" } },
  { field: "responsiblePersonName", title: "负责人", width: 140 },
  { field: "assisterName", title: "协助人", width: 140 },
  { field: "deadline", title: "截止时间", width: 180 },
  { field: "reviewTitle", title: "整改记录", minWidth: 240 },
  { field: "status", title: "状态", minWidth: 120, slots: { default: "status" } }
];

const resolveImageUrl = (path?: string | null) => {
  if (!path) return "";
  return /^https?:\/\//.test(path) ? path : FILE_ACCESS_URL + path;
};

const buildQueryParams = (pageQuery?: PageQuery) => {
  const createTimeRange = Array.isArray(searchParams.value.createTimeRange)
    ? searchParams.value.createTimeRange.filter(Boolean).join(",")
    : undefined;

  return {
    ...searchParams.value,
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

const loadExportRecords = async () => {
  exportRecordLoading.value = true;
  try {
    const resp = await get6sProblemExportRecordListApi();
    exportRecords.value = resp.data || [];
  } finally {
    exportRecordLoading.value = false;
  }
};

const onExport = async () => {
  exportLoading.value = true;
  try {
    await export6sProblemsApi(buildQueryParams());
    message.success("已开始导出，请稍后在导出记录中下载");
  } finally {
    exportLoading.value = false;
  }
};

const onOpenExportRecord = async () => {
  exportRecordOpen.value = true;
  await loadExportRecords();
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
  const resp = await get6sProblemPageListApi(buildQueryParams(pageQuery));

  return {
    result: resp.data.records as Cmt6sReviewProblemVO[],
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

.image-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
}

.table-image :deep(.ant-image-img) {
  object-fit: contain;
  border-radius: 6px;
}
</style>
