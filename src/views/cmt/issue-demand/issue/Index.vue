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
        <span class="mr-1 pl-1 text-[15px] font-bold">问题反馈列表</span>
      </template>

      <template #systemType="{ row }">
        <a-tag v-if="row.systemType !== null && row.systemType !== undefined && row.systemType !== ''" color="processing">
          {{ formatSystemType(row) }}
        </a-tag>
        <span v-else>-</span>
      </template>

      <template #status="{ row }">
        <div class="status-tags">
          <a-tag :color="STATUS_COLOR_MAP[row.status] || 'default'">
            {{ STATUS_TEXT_MAP[row.status] || "-" }}
          </a-tag>
          <a-tag v-if="isOverdue(row)" color="error">
            已逾期
          </a-tag>
        </div>
      </template>

      <template #action="{ row }">
        <a-button type="link" size="small" @click="onDetail(row.id)">详情</a-button>
      </template>
    </TableContainer>

    <IssueDetail v-model:open="detailOpen" :data="detailData" />
  </div>
</template>

<script setup lang="ts">
import { getDeptSelectionApi, type CmtDeptSelectionVO } from "@/api/cmt/cmt-dept";
import { getIssueDemandListApi, type IssueDemandVO } from "@/api/cmt/cmt-issue-demand";
import { getDictItemsByCodeApi, type SysDataDictItemSelectionVO } from "@/api/data-dict";
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer, { type PageQuery } from "@/components/TableContainer.vue";
import { Select } from "ant-design-vue";
import { computed, onMounted, ref } from "vue";
import type { VxeGridPropTypes } from "vxe-table";
import { isIssueDemandOverdue } from "../utils";
import IssueDetail from "./components/IssueDetail.vue";

interface SearchParams {
  status?: number | null;
  systemType?: number | string | null;
  isOverdue?: string | null;
  proposeDept?: string | null;
}

const ISSUE_TYPE = 1;

const STATUS_TEXT_MAP: Record<number, string> = {
  0: "待处理",
  1: "确认中",
  2: "修复中",
  3: "已完成",
  4: "已驳回",
  5: "已关闭"
};

const STATUS_COLOR_MAP: Record<number, string> = {
  0: "default",
  1: "processing",
  2: "blue",
  3: "success",
  4: "warning",
  5: "error"
};

const searchParams = ref<SearchParams>({});
const deptOptions = ref<CmtDeptSelectionVO[]>([]);
const systemTypeOptions = ref<SysDataDictItemSelectionVO[]>([]);

const normalizeOptionValue = (value: string) => (/^\d+$/.test(value) ? Number(value) : value);

const systemTypeSearchOptions = computed(() => [
  { label: "其他", value: 0 },
  ...systemTypeOptions.value
    .filter((item) => item.value !== "0")
    .map((item) => ({
      label: item.text,
      value: normalizeOptionValue(item.value)
    }))
]);

const searchFieldItems = computed<SearchFieldItem[]>(() => [
  {
    label: "提出部门",
    field: "proposeDept",
    component: Select,
    componentProps: {
      placeholder: "请选择",
      allowClear: true,
      showSearch: true,
      optionFilterProp: "label",
      options: deptOptions.value.map((item) => ({
        label: item.text,
        value: item.text
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
    label: "所属系统",
    field: "systemType",
    component: Select,
    componentProps: {
      placeholder: "请选择",
      allowClear: true,
      showSearch: true,
      optionFilterProp: "label",
      options: systemTypeSearchOptions.value
    }
  },
  {
    label: "是否逾期",
    field: "isOverdue",
    component: Select,
    componentProps: {
      placeholder: "请选择",
      allowClear: true,
      options: [
        { label: "是", value: "1" },
        { label: "否", value: "0" }
      ]
    }
  }
]);

const searchLoading = ref(false);
const tableRef = ref<InstanceType<typeof TableContainer>>();
const detailOpen = ref(false);
const detailData = ref<{ id?: string }>({});
const hasOverdueInCurrentPage = ref(false);

const isOverdue = (row: IssueDemandVO) => {
  return isIssueDemandOverdue(row);
};

const formatSystemType = (row: IssueDemandVO) => {
  if (String(row.systemType) === "0" && row.otherSystem) return row.otherSystem;

  const value = row.systemType;
  if (value === null || value === undefined) return "-";

  const matchedItem = systemTypeOptions.value.find((item) => item.value === String(value));
  return matchedItem?.text || String(value);
};

const statusColumnWidth = computed(() => (hasOverdueInCurrentPage.value ? 136 : 76));

const columns = computed<VxeGridPropTypes.Columns<any>>(() => [
  { field: "title", title: "标题", minWidth: 240 },
  { field: "systemType", title: "所属系统", width: 140, slots: { default: "systemType" } },
  { field: "proposeDept", title: "提出部门", width: 140 },
  { field: "proposeUserName", title: "提出人", width: 140 },
  { field: "principalUserName", title: "负责人", width: 140 },
  { field: "status", title: "状态", width: statusColumnWidth.value, slots: { default: "status" } },
  { field: "expectedFinishTime", title: "期望完成时间", width: 140 },
  { field: "planFinishTime", title: "计划完成时间", width: 140 },
  { field: "actualFinishTime", title: "实际完成时间",width:140},
  { field: "createTime", title: "创建时间", width: 180 }
]);

const loadDeptOptions = async () => {
  const resp = await getDeptSelectionApi();
  deptOptions.value = resp.data || [];
};

const loadSystemTypeOptions = async () => {
  const resp = await getDictItemsByCodeApi("GSXT");
  systemTypeOptions.value = resp.data || [];
};

const onDetail = (id: string) => {
  detailData.value = { id };
  detailOpen.value = true;
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
  const resp = await getIssueDemandListApi({
    type: ISSUE_TYPE,
    ...searchParams.value,
    ...pageQuery
  });

  hasOverdueInCurrentPage.value = resp.data.records.some((item) => isOverdue(item));

  return {
    result: resp.data.records,
    total: resp.data.total
  };
};

onMounted(async () => {
  await Promise.allSettled([loadDeptOptions(), loadSystemTypeOptions()]);
});
</script>

<style scoped>
.status-tags {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  white-space: nowrap;
}
</style>
