<template>
  <a-modal
    title="导出记录"
    :width="820"
    :open="open"
    :mask-closable="true"
    @cancel="handleClose"
  >
    <div class="mb-3 flex justify-end">
      <a-button :loading="loading" @click="onRefresh">刷新</a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="records"
      :loading="loading"
      :pagination="false"
      row-key="id"
      size="small"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <template v-else-if="column.key === 'message'">
          <span>{{ record.message || '-' }}</span>
        </template>

        <template v-else-if="column.key === 'action'">
          <a-button
            type="link"
            size="small"
            :disabled="record.status !== 1 || !record.path"
            @click="onDownload(record)"
          >
            下载
          </a-button>
        </template>
      </template>
    </a-table>

    <template #footer>
      <a-button @click="handleClose">关闭</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import type { Cmt6sProblemExportRecordVO } from "@/api/cmt/cmt-6s";
import { computed } from "vue";

const props = defineProps<{
  open: boolean;
  records: Cmt6sProblemExportRecordVO[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "refresh"): void;
}>();

const FILE_ACCESS_URL = window.location.origin + import.meta.env.VITE_FILE_ACCESS_PATH_PREFIX;

const columns = computed(() => [
  {
    title: "文件名",
    dataIndex: "name",
    key: "name",
    ellipsis: true
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 120
  },
  {
    title: "导出时间",
    dataIndex: "createTime",
    key: "createTime",
    width: 180
  },
  {
    title: "备注",
    dataIndex: "message",
    key: "message",
    ellipsis: true
  },
  {
    title: "操作",
    key: "action",
    width: 100,
    align: "center" as const
  }
]);

const getStatusText = (status?: number) => {
  if (status === 1) return "导出完成";
  if (status === 0) return "导出中";
  if (status === 2) return "导出失败";
  return "未知";
};

const getStatusColor = (status?: number) => {
  if (status === 1) return "success";
  if (status === 0) return "processing";
  if (status === 2) return "error";
  return "default";
};

const handleClose = () => {
  emit("update:open", false);
};

const onRefresh = () => {
  emit("refresh");
};

const resolveDownloadUrl = (path?: string) => {
  if (!path) return "";
  return /^https?:\/\//.test(path) ? path : FILE_ACCESS_URL + path;
};

const onDownload = (record: Cmt6sProblemExportRecordVO) => {
  const downloadUrl = resolveDownloadUrl(record.path);
  if (!downloadUrl) return;

  window.open(downloadUrl, "_blank");
};
</script>

<style scoped></style>
