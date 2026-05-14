<template>
  <div class="page-container h-full flex flex-col gap-3">
    <SearchForm
      v-model="searchParams"
      :items="searchFieldItems"
      :loading="searchLoading"
      @search="onSearch"
      @reset="onReset"
    />

    <div class="flex-1 min-h-0">
      <TableContainer
        ref="tableRef"
        :columns="columns"
        :request="getList"
        :showPager="true"
        :page-size="10"
        :grid-props="{ showOverflow: false }"
      >
        <template #toolbar-left>
          <span class="mr-1 pl-1 text-[15px] font-bold">考勤查询</span>
        </template>

        <template #toolbar-right>
          <div class="flex gap-2 m-2">
            <a-button :loading="exportRecordLoading" @click="onOpenExportRecord">导出记录</a-button>
            <a-button type="primary" :loading="exportLoading" @click="onExport">导出</a-button>
          </div>
        </template>

        <template #dayCell="{ row, column }">
          <div class="day-cell">
            <template v-if="getDayRecords(row, String(column.field)).length">
              <div
                v-for="(item, index) in getDayRecords(row, String(column.field))"
                :key="`${row.id}-${String(column.field)}-${index}`"
                class="day-cell-line"
                :class="getDayLineClass(item)"
              >
                {{ item }}
              </div>
            </template>
            <span v-else class="day-cell-empty">-</span>
          </div>
        </template>
      </TableContainer>
    </div>

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
  exportAttendMonthDataApi,
  getAttendMonthDataApi,
  getAttendExportRecordListApi,
  type AttendDayCaseVO,
  type AttendMonthDataVO,
  type CmtAttendExportRecordVO
} from "@/api/cmt/cmt-attend";
import { getDeptSelectionApi, type CmtDeptSelectionVO } from "@/api/cmt/cmt-dept";
import { getUserSelectionApi, type CmtUserSelectionVO } from "@/api/cmt/cmt-user";
import SearchForm, { type SearchFieldItem } from "@/components/SearchForm.vue";
import TableContainer, { type PageQuery } from "@/components/TableContainer.vue";
import zhCN from "ant-design-vue/es/date-picker/locale/zh_CN";
import dayjs from "dayjs";
import { DatePicker, message, Select } from "ant-design-vue";
import { computed, onMounted, ref } from "vue";
import type { VxeGridPropTypes } from "vxe-table";
import ExportRecordModal from "./components/ExportRecordModal.vue";

interface SearchParams {
  userIds?: string[];
  dept?: string | null;
  month?: string;
}

interface AttendMonthTableRow extends Record<string, any> {
  id: string;
  username: string;
  dept: string;
  attendDays: string;
  leaveDays: string;
  bizTripDays: string;
  lateCount: string;
  lateDuration: string;
  earlyCount: string;
  earlyDuration: string;
  overtimeDuration: string;
  shortages: string;
}

const DEFAULT_MONTH = dayjs().format("YYYY-MM");
const MONTH_VALUE_FORMAT = "YYYY-MM";

const searchParams = ref<SearchParams>({
  month: DEFAULT_MONTH
});
const queriedUserIds = ref<string[]>([]);
const searchLoading = ref(false);
const exportLoading = ref(false);
const exportRecordOpen = ref(false);
const exportRecordLoading = ref(false);
const exportRecords = ref<CmtAttendExportRecordVO[]>([]);
const tableRef = ref<InstanceType<typeof TableContainer>>();
const deptOptions = ref<CmtDeptSelectionVO[]>([]);
const userOptions = ref<CmtUserSelectionVO[]>([]);

const selectedMonth = computed(() => dayjs(searchParams.value.month || DEFAULT_MONTH, MONTH_VALUE_FORMAT));
const daysInMonth = computed(() => selectedMonth.value.daysInMonth());

const buildDayField = (day: number) => `day_${day}`;

const searchFieldItems = computed<SearchFieldItem[]>(() => [
  {
    label: "部门",
    field: "dept",
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
    label: "人员",
    field: "userIds",
    component: Select,
    componentProps: {
      mode: "multiple",
      placeholder: "请选择",
      allowClear: true,
      showSearch: true,
      maxTagCount: "responsive",
      optionFilterProp: "label",
      onChange: onUserChange,
      options: userOptions.value.map((item) => ({
        label: item.name || item.id,
        value: item.id
      }))
    }
  },
  {
    label: "月份",
    field: "month",
    component: DatePicker,
    componentProps: {
      picker: "month",
      allowClear: false,
      locale: zhCN,
      format: "YYYY年MM月",
      valueFormat: MONTH_VALUE_FORMAT,
      placeholder: "请选择月份",
      onChange: onMonthChange
    }
  }
]);

const fixedColumns: VxeGridPropTypes.Columns<AttendMonthTableRow> = [
  {
    field: "username",
    title: "人员",
    fixed: "left",
    width: 140,
    align: "center"
  },
  {
    field: "dept",
    title: "部门",
    fixed: "left",
    width: 140,
    align: "center"
  },
  {
    field: "attendDays",
    title: "实际出勤",
    fixed: "left",
    width: 110,
    align: "center"
  },
  {
    field: "leaveDays",
    title: "请假",
    fixed: "left",
    width: 100,
    align: "center"
  },
  {
    field: "overtimeDuration",
    title: "加班",
    fixed: "left",
    width: 120,
    align: "center"
  },
  {
    field: "bizTripDays",
    title: "出差",
    fixed: "left",
    width: 100,
    align: "center"
  },
  {
    field: "lateCount",
    title: "迟到（次）",
    fixed: "left",
    width: 110,
    align: "center"
  },
  {
    field: "lateDuration",
    title: "迟到（分钟）",
    fixed: "left",
    width: 120,
    align: "center"
  },
  {
    field: "earlyCount",
    title: "早退（次）",
    fixed: "left",
    width: 110,
    align: "center"
  },
  {
    field: "earlyDuration",
    title: "早退（分钟）",
    fixed: "left",
    width: 120,
    align: "center"
  },
  {
    field: "shortages",
    title: "缺卡（次）",
    fixed: "left",
    width: 110,
    align: "center"
  }
];

const dayColumns = computed<VxeGridPropTypes.Columns<AttendMonthTableRow>>(() =>
  Array.from({ length: daysInMonth.value }, (_, index) => {
    const day = index + 1;

    return {
      field: buildDayField(day),
      title: `${selectedMonth.value.month() + 1}.${day}`,
      width: 280,
      align: "center",
      slots: { default: "dayCell" }
    };
  })
);

const columns = computed<VxeGridPropTypes.Columns<AttendMonthTableRow>>(() => [
  ...fixedColumns,
  ...dayColumns.value
]);

const formatTextValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

const normalizeDayRecords = (dayCases: AttendDayCaseVO[] = []) => {
  const recordsMap = new Map<number, string[]>();

  dayCases.forEach((item) => {
    if (!item.day || item.day < 1 || item.day > daysInMonth.value) return;
    recordsMap.set(
      item.day,
      Array.isArray(item.data) ? item.data.filter((value) => Boolean(value)) : []
    );
  });

  return recordsMap;
};

const buildRows = (list: AttendMonthDataVO[]) => {
  return list.map((item, index) => {
    const fallbackUserId = queriedUserIds.value[index] || queriedUserIds.value[0];
    const row: AttendMonthTableRow = {
      id: item.userId || `${fallbackUserId || "unknown"}-${index}`,
      username: formatTextValue(item.username),
      dept: formatTextValue(item.dept),
      attendDays: formatTextValue(item.attendDaysText || item.attendDays),
      leaveDays: formatTextValue(item.leaveDaysText || item.leaveDays),
      bizTripDays: formatTextValue(item.bizTripDaysText),
      lateCount: formatTextValue(item.lateCount),
      lateDuration: formatTextValue(item.lateDuration),
      earlyCount: formatTextValue(item.earlyCount),
      earlyDuration: formatTextValue(item.earlyDuration),
      overtimeDuration: formatTextValue(item.overtimeDuration),
      shortages: formatTextValue(item.shortages)
    };

    const dayRecordsMap = normalizeDayRecords(item.dayCases || []);

    Array.from({ length: daysInMonth.value }, (_, dayIndex) => {
      const day = dayIndex + 1;
      row[buildDayField(day)] = dayRecordsMap.get(day) || [];
      return day;
    });

    return row;
  });
};

const getDayRecords = (row: AttendMonthTableRow, field: string) => {
  const records = row[field];
  return Array.isArray(records) ? records : [];
};

const getDayLineClass = (text: string) => {
  if (text.includes("请假")) return "is-leave";
  if (text.includes("出差") || text.includes("公出")) return "is-business-trip";
  if (text.includes("外出") || text.includes("外勤")) return "is-outing";
  if (text.includes("加班")) return "is-overtime";
  if (
    text.includes("缺卡") ||
    text.includes("迟到") ||
    text.includes("早退") ||
    text.includes("旷工") ||
    text.includes("异常")
  ) {
    return "is-abnormal";
  }
  if (text.includes("正常")) return "is-normal";
  if (text.includes("休息")) return "is-rest";

  return "is-default";
};

const loadUserOptions = async () => {
  const resp = await getUserSelectionApi();
  userOptions.value = resp.data || [];
};

const loadDeptOptions = async () => {
  const resp = await getDeptSelectionApi();
  deptOptions.value = resp.data || [];
};

const normalizeUserIds = (userIds?: string[]) =>
  Array.isArray(userIds) ? userIds.filter(Boolean) : [];

const buildQueryParams = (pageQuery?: PageQuery) => ({
  userIds: queriedUserIds.value,
  year: selectedMonth.value.format("YYYY"),
  month: selectedMonth.value.format("MM"),
  dept: searchParams.value.dept,
  ...pageQuery
});

const loadExportRecords = async () => {
  exportRecordLoading.value = true;
  try {
    const resp = await getAttendExportRecordListApi();
    exportRecords.value = resp.data || [];
  } finally {
    exportRecordLoading.value = false;
  }
};

const reloadByUsers = async (userIds?: string[]) => {
  const nextUserIds = normalizeUserIds(userIds);
  searchParams.value.userIds = nextUserIds.length ? nextUserIds : undefined;
  queriedUserIds.value = nextUserIds;
  searchLoading.value = true;
  try {
    tableRef.value?.resetPager();
    await tableRef.value?.reload();
  } finally {
    searchLoading.value = false;
  }
};

const onUserChange = async (value?: string[]) => {
  await reloadByUsers(value);
};

const onMonthChange = async (value?: string) => {
  searchParams.value.month = value || DEFAULT_MONTH;
  tableRef.value?.resetPager();
  await tableRef.value?.reload();
};

const onSearch = async () => {
  await reloadByUsers(searchParams.value.userIds);
};

const onReset = async () => {
  searchParams.value = {
    month: DEFAULT_MONTH
  };
  await reloadByUsers();
};

const onExport = async () => {
  exportLoading.value = true;
  try {
    await exportAttendMonthDataApi(buildQueryParams());
    message.success("已开始导出，请稍后在导出记录中下载");
  } finally {
    exportLoading.value = false;
  }
};

const onOpenExportRecord = async () => {
  exportRecordOpen.value = true;
  await loadExportRecords();
};

const getList = async (pageQuery: PageQuery) => {
  const resp = await getAttendMonthDataApi(buildQueryParams(pageQuery));

  const list = Array.isArray(resp.data?.records) ? resp.data.records : [];
  const rows = buildRows(list);

  return {
    result: rows,
    total: resp.data?.total || 0
  };
};

onMounted(async () => {
  await Promise.allSettled([loadDeptOptions(), loadUserOptions()]);
});
</script>

<style scoped>
.day-cell {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
  text-align: center;
}

.day-cell-line {
  line-height: 20px;
  white-space: nowrap;
  word-break: keep-all;
}

.day-cell-empty {
  color: #999;
  line-height: 20px;
}

.is-normal {
  color: #16a34a;
}

.is-rest {
  color: #8c8c8c;
}

.is-leave {
  color: #fa8c16;
}

.is-business-trip {
  color: #1677ff;
}

.is-outing {
  color: #13c2c2;
}

.is-overtime {
  color: #722ed1;
}

.is-abnormal {
  color: #ff4d4f;
}

.is-default {
  color: #1f1f1f;
}

:deep(.vxe-header--column .vxe-cell) {
  white-space: normal;
  line-height: 20px;
  padding-top: 8px;
  padding-bottom: 8px;
}

:deep(.vxe-body--column .vxe-cell) {
  white-space: normal;
}
</style>
