
<template>
  <div class="page-container user-index h-full">
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
      :page-size="50"
      showActionColumn
      :action-column-props="{ width: 100 }"
    >
      <template #toolbar-left>
        <span class="mr-1 pl-1 text-[15px] font-bold">问题 / 需求列表</span>
      </template>

      <template #type="{ row }">
        <a-tag :color="getTypeColor(row.type)">
          {{ TYPE_TEXT_MAP[row.type] || "-" }}
        </a-tag>
      </template>

      <template #title="{ row }">
        <div class="title-cell">
          <ThunderboltFilled v-if="row.isUrgent === 1" class="urgent-icon" />
          <span>{{ row.title || "-" }}</span>
        </div>
      </template>

      <template #systemType="{ row }">
        <a-tag
          v-if="row.systemType !== null && row.systemType !== undefined && row.systemType !== ''"
          :color="getSystemTypeColor(row.systemType)"
        >
          {{ formatSystemType(row) }}
        </a-tag>
        <span v-else>-</span>
      </template>

      <template #status="{ row }">
        <a-tooltip v-if="isOverdue(row)" :title="OVERDUE_TOOLTIP">
          <a-tag :color="OVERDUE_COLOR">
            {{ STATUS_TEXT_MAP[row.status] || "-" }}
          </a-tag>
        </a-tooltip>
        <a-tag v-else :color="STATUS_COLOR_MAP[row.status] || 'default'">
          {{ STATUS_TEXT_MAP[row.status] || "-" }}
        </a-tag>
      </template>

      <template #action="{ row }">
        <a-button type="link" size="small" @click="onDetail(row)">详情</a-button>
      </template>
    </TableContainer>

    <IssueDetail
      v-if="detailType === ISSUE_TYPE"
      v-model:open="detailOpen"
      :data="detailData"
    />
    <DemandDetail
      v-else-if="detailType === DEMAND_TYPE"
      v-model:open="detailOpen"
      :data="detailData"
    />
  </div>
</template>

<script setup lang="ts">
import { getDeptSelectionApi, type CmtDeptSelectionVO } from "@/api/cmt/cmt-dept";
import { getIssueDemandListApi, type IssueDemandVO } from "@/api/cmt/cmt-issue-demand";
import { getUserSelectionApi, type CmtUserSelectionVO } from "@/api/cmt/cmt-user";
import { getDictItemsByCodeApi, type SysDataDictItemSelectionVO } from "@/api/data-dict";
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer, { type PageQuery } from "@/components/TableContainer.vue";
import { ThunderboltFilled } from "@ant-design/icons-vue";
import { Select } from "ant-design-vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { VxeGridPropTypes } from "vxe-table";
import {
  ISSUE_DEMAND_OVERDUE_COLOR,
  ISSUE_DEMAND_OVERDUE_TOOLTIP,
  ISSUE_DEMAND_STATUS_COLOR_MAP,
  ISSUE_DEMAND_STATUS_TEXT_MAP,
  getIssueDemandSystemTypeColor,
  isIssueDemandOverdue
} from "../utils";
import DemandDetail from "../demand/components/DemandDetail.vue";
import IssueDetail from "../issue/components/IssueDetail.vue";

interface SearchParams {
  type?: number | null;
  status?: number[] | null;
  systemType?: number | string | null;
  isUrgent?: number | null;
  isOverdue?: string | null;
  isAcceptanceOverdue?: string | null;
  proposeDept?: string | null;
  proposeUserId?: string | null;
  principalUserId?: string | null;
}

const ISSUE_TYPE = 1;
const DEMAND_TYPE = 2;
const ISSUE_DEMAND_LIST_FILTER_STORAGE_KEY = "issue-demand-list-filter";
const TYPE_TEXT_MAP: Record<number, string> = {
  [ISSUE_TYPE]: "问题反馈",
  [DEMAND_TYPE]: "需求开发"
};
const TYPE_COLOR_MAP: Record<number, string> = {
  [ISSUE_TYPE]: "blue",
  [DEMAND_TYPE]: "purple"
};
const STATUS_TEXT_MAP = ISSUE_DEMAND_STATUS_TEXT_MAP;
const STATUS_COLOR_MAP = ISSUE_DEMAND_STATUS_COLOR_MAP;
const OVERDUE_COLOR = ISSUE_DEMAND_OVERDUE_COLOR;
const OVERDUE_TOOLTIP = ISSUE_DEMAND_OVERDUE_TOOLTIP;

const route = useRoute();
const parseNumberQuery = (value: unknown) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numberValue = Number(rawValue);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const getStoredSearchParams = (): SearchParams => {
  const storedValue = sessionStorage.getItem(ISSUE_DEMAND_LIST_FILTER_STORAGE_KEY);
  if (!storedValue) return {};

  sessionStorage.removeItem(ISSUE_DEMAND_LIST_FILTER_STORAGE_KEY);
  try {
    const parsedValue = JSON.parse(storedValue) as SearchParams;
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
};

const getRouteSearchParams = (): SearchParams => {
  const type = parseNumberQuery(route.query.type);
  if (type !== null) return { type };
  return getStoredSearchParams();
};

const searchParams = ref<SearchParams>(getRouteSearchParams());
const deptOptions = ref<CmtDeptSelectionVO[]>([]);
const userOptions = ref<CmtUserSelectionVO[]>([]);
const systemTypeOptions = ref<SysDataDictItemSelectionVO[]>([]);
const searchLoading = ref(false);
const tableRef = ref<InstanceType<typeof TableContainer>>();
const detailOpen = ref(false);
const detailType = ref<number | null>(null);
const detailData = ref<{ id?: string }>({});

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

const userSearchOptions = computed(() =>
  userOptions.value.map((item) => ({
    label: item.name,
    value: item.id
  }))
);

const typeSearchOptions = computed(() =>
  Object.entries(TYPE_TEXT_MAP).map(([value, label]) => ({
    label,
    value: Number(value)
  }))
);

const searchFieldItems = computed<SearchFieldItem[]>(() => [
  {
    label: "状态",
    field: "status",
    component: Select,
    componentProps: {
      placeholder: "请选择",
      allowClear: true,
      mode: "multiple",
      maxTagCount: "responsive",
      options: Object.entries(STATUS_TEXT_MAP).map(([value, label]) => ({
        label,
        value: Number(value)
      }))
    }
  },
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
    label: "提出人",
    field: "proposeUserId",
    component: Select,
    componentProps: {
      placeholder: "请选择",
      allowClear: true,
      showSearch: true,
      optionFilterProp: "label",
      options: userSearchOptions.value
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
      options: userSearchOptions.value
    }
  },
  {
    label: "是否紧急",
    field: "isUrgent",
    component: Select,
    componentProps: {
      placeholder: "请选择",
      allowClear: true,
      options: [
        { label: "是", value: 1 },
        { label: "否", value: 0 }
      ]
    }
  },
  {
    label: "类型",
    field: "type",
    component: Select,
    componentProps: {
      placeholder: "请选择",
      allowClear: true,
      options: typeSearchOptions.value
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
    label: "是否开发逾期",
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
  },
  {
    label: "是否验收逾期",
    field: "isAcceptanceOverdue",
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

const columns = computed<VxeGridPropTypes.Columns<IssueDemandVO>>(() => [
  { field: "serialNo", title: "编号", width: 140 },
  { field: "type", title: "类型", width: 110, slots: { default: "type" } },
  { field: "title", title: "标题", minWidth: 240, slots: { default: "title" } },
  { field: "systemType", title: "所属系统", width: 140, slots: { default: "systemType" } },
  { field: "proposeDept", title: "提出部门", width: 140 },
  { field: "proposeUserName", title: "提出人", width: 140 },
  { field: "principalUserName", title: "负责人", width: 140 },
  { field: "status", title: "状态", width: 90, slots: { default: "status" } },
  { field: "expectedFinishTime", title: "期望完成时间", width: 140 },
  { field: "planFinishTime", title: "计划完成时间", width: 140 },
  { field: "actualFinishTime", title: "实际完成时间", width: 140 },
  { field: "devCostTime", title: "开发耗时", width: 120 },
  { field: "totalCostTime", title: "总耗时", width: 120 },
  { field: "createTime", title: "创建时间", width: 180 }
]);

const isOverdue = (row: IssueDemandVO) => {
  if (row.status === 3 && row.acceptanceIsOverdue === 1 && row.devIsOverdue !== 1) {
    return false;
  }

  return isIssueDemandOverdue(row);
};

const getTypeColor = (value?: number | null) => TYPE_COLOR_MAP[value ?? -1] || "default";

const getSystemTypeColor = (value?: number | string | null) => getIssueDemandSystemTypeColor(value);

const formatSystemType = (row: IssueDemandVO) => {
  if (String(row.systemType) === "0" && row.otherSystem) return row.otherSystem;

  const value = row.systemType;
  if (value === null || value === undefined) return "-";

  const matchedItem = systemTypeOptions.value.find((item) => item.value === String(value));
  return matchedItem?.text || String(value);
};

const loadDeptOptions = async () => {
  const resp = await getDeptSelectionApi();
  deptOptions.value = resp.data || [];
};

const loadUserOptions = async () => {
  const resp = await getUserSelectionApi();
  userOptions.value = resp.data || [];
};

const loadSystemTypeOptions = async () => {
  const resp = await getDictItemsByCodeApi("GSXT");
  systemTypeOptions.value = resp.data || [];
};

const onDetail = (row: IssueDemandVO) => {
  detailData.value = { id: row.id };
  detailType.value = row.type || ISSUE_TYPE;
  detailOpen.value = true;
};

const onSearch = async (params?: SearchParams) => {
  if (params) {
    searchParams.value = { ...params };
  }
  tableRef.value?.resetPager();
  tableRef.value?.reload();
};

const onReset = async (params?: SearchParams) => {
  searchParams.value = params ? { ...params } : {};
  tableRef.value?.resetPager();
  tableRef.value?.reload();
};

const formatStatusParam = (status?: number[] | null) => {
  if (!Array.isArray(status) || status.length === 0) return undefined;
  return status.join(",");
};

const getList = async (pageQuery: PageQuery) => {
  const { status, ...restSearchParams } = searchParams.value;
  const resp = await getIssueDemandListApi({
    ...restSearchParams,
    status: formatStatusParam(status),
    ...pageQuery
  });

  return {
    result: resp.data.records,
    total: resp.data.total
  };
};

onMounted(async () => {
  await Promise.allSettled([loadDeptOptions(), loadUserOptions(), loadSystemTypeOptions()]);
});

watch(
  () => route.query,
  () => {
    if (route.path !== "/issue-demand/list") return;

    searchParams.value = getRouteSearchParams();
    tableRef.value?.resetPager();
    tableRef.value?.reload();
  }
);
</script>

<style scoped>
.title-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
}

.title-cell span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.urgent-icon {
  flex: 0 0 auto;
  color: #ff4d4f;
  font-size: 16px;
}
</style>
