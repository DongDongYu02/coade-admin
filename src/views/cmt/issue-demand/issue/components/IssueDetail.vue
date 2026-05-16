<template>
  <a-drawer title="问题反馈详情" :width="720" :open="open" @close="handleClose">
    <a-spin :spinning="loading">
      <div class="info-section">
        <div class="section-title">
          <ProfileOutlined />
          <span>基本信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">编号</span>
            <span class="info-value">{{ record?.serialNo || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">标题</span>
            <span class="info-value title-value">
              <ThunderboltFilled v-if="record?.isUrgent === 1" class="urgent-icon" />
              <span>{{ record?.title || "-" }}</span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">状态</span>
            <span class="status-value">
              <a-tooltip v-if="record && isOverdue(record)" :title="OVERDUE_TOOLTIP">
                <a-tag :color="OVERDUE_COLOR">
                  {{ STATUS_TEXT_MAP[record?.status ?? -1] || "-" }}
                </a-tag>
              </a-tooltip>
              <a-tag v-else :color="STATUS_COLOR_MAP[record?.status ?? -1] || 'default'">
                {{ STATUS_TEXT_MAP[record?.status ?? -1] || "-" }}
              </a-tag>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">所属系统</span>
            <span class="system-type-value">
              <a-tag
                v-if="record?.systemType !== null && record?.systemType !== undefined"
                :color="getSystemTypeColor(record?.systemType)"
              >
                {{ formatSystemType(record) }}
              </a-tag>
              <span v-else class="info-value">-</span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">提出部门</span>
            <span class="info-value">{{ record?.proposeDept || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">提出人</span>
            <span class="info-value">{{ record?.proposeUserName || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">负责人</span>
            <span class="info-value">{{ record?.principalUserName || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">期望完成时间</span>
            <span class="info-value">{{ record?.expectedFinishTime || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">计划完成时间</span>
            <span class="info-value">{{ record?.planFinishTime || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">实际完成时间</span>
            <span class="info-value">{{ record?.actualFinishTime || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">开发耗时</span>
            <span class="info-value">{{ record?.devCostTime || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">总耗时</span>
            <span class="info-value">{{ record?.totalCostTime || "-" }}</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-title">
          <FileTextOutlined />
          <span>问题描述</span>
        </div>
        <div class="info-grid">
          <div class="info-item full-span">
            <span class="info-label">内容</span>
            <div class="info-value multiline-text">{{ record?.description || "-" }}</div>
          </div>
        </div>
      </div>

      <div v-if="showResultFeedback" class="info-section">
        <div class="section-title">
          <MessageOutlined />
          <span>结果反馈</span>
        </div>
        <div class="info-grid">
          <div class="info-item full-span">
            <span class="info-label">反馈</span>
            <div class="info-value multiline-text">{{ record?.resultFeedback || "-" }}</div>
          </div>
          <div class="info-item full-span">
            <span class="info-label">反馈附件</span>
            <div v-if="record?.feedbackAttachments?.length" class="attachment-list">
              <div
                v-for="attachment in record.feedbackAttachments"
                :key="attachment.id"
                class="attachment-item"
              >
                <div class="attachment-main">
                  <span class="info-value attachment-name">
                    {{ attachment.originName || attachment.name || "-" }}
                  </span>
                  <span class="attachment-extra">{{ attachment.mime || "未知类型" }}</span>
                  <span class="attachment-extra">{{ formatFileSize(attachment.size) }}</span>
                </div>
                <a
                  v-if="resolveAttachmentUrl(attachment)"
                  :href="resolveAttachmentUrl(attachment)"
                  target="_blank"
                  rel="noreferrer"
                >
                  查看
                </a>
                <span v-else class="text-placeholder">-</span>
              </div>
            </div>
            <span v-else class="text-placeholder">暂无附件</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-title">
          <PaperClipOutlined />
          <span>附件信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item full-span">
            <span class="info-label">附件</span>
            <div v-if="record?.attachments?.length" class="attachment-list">
              <div v-for="attachment in record.attachments" :key="attachment.id" class="attachment-item">
                <div class="attachment-main">
                  <span class="info-value attachment-name">
                    {{ attachment.originName || attachment.name || "-" }}
                  </span>
                  <span class="attachment-extra">{{ attachment.mime || "未知类型" }}</span>
                  <span class="attachment-extra">{{ formatFileSize(attachment.size) }}</span>
                </div>
                <a
                  v-if="resolveAttachmentUrl(attachment)"
                  :href="resolveAttachmentUrl(attachment)"
                  target="_blank"
                  rel="noreferrer"
                >
                  查看
                </a>
                <span v-else class="text-placeholder">-</span>
              </div>
            </div>
            <span v-else class="text-placeholder">暂无附件</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="section-title">
          <ClockCircleOutlined />
          <span>系统信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">创建人</span>
            <span class="info-value">{{ record?.creator || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建人ID</span>
            <a-typography-text class="info-value" copyable>
              {{ record?.createBy || "-" }}
            </a-typography-text>
          </div>
          <div class="info-item">
            <span class="info-label">创建端</span>
            <span class="info-value">{{ record?.createClient || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ record?.createTime || "-" }}</span>
          </div>
        </div>
      </div>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
import {
  getIssueDemandDetailApi,
  type AttachmentVO,
  type IssueDemandDetailVO
} from "@/api/cmt/cmt-issue-demand";
import {
  getDictItemsByCodeApi,
  type SysDataDictItemSelectionVO
} from "@/api/data-dict";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  MessageOutlined,
  PaperClipOutlined,
  ProfileOutlined,
  ThunderboltFilled
} from "@ant-design/icons-vue";
import { computed, ref, watch } from "vue";
import {
  ISSUE_DEMAND_OVERDUE_COLOR,
  ISSUE_DEMAND_OVERDUE_TOOLTIP,
  ISSUE_DEMAND_STATUS_COLOR_MAP,
  ISSUE_DEMAND_STATUS_TEXT_MAP,
  getIssueDemandSystemTypeColor,
  isIssueDemandOverdue
} from "../../utils";

const FILE_ACCESS_URL = window.location.origin + import.meta.env.VITE_FILE_ACCESS_PATH_PREFIX;
const STATUS_TEXT_MAP = ISSUE_DEMAND_STATUS_TEXT_MAP;
const STATUS_COLOR_MAP = ISSUE_DEMAND_STATUS_COLOR_MAP;
const OVERDUE_COLOR = ISSUE_DEMAND_OVERDUE_COLOR;
const OVERDUE_TOOLTIP = ISSUE_DEMAND_OVERDUE_TOOLTIP;

const props = defineProps<{
  open: boolean;
  data?: { id?: string } | null;
}>();

const emit = defineEmits<{
  (e: "update:open", v: boolean): void;
}>();

const open = ref(false);
const loading = ref(false);
const record = ref<IssueDemandDetailVO | null>(null);
const systemTypeOptions = ref<SysDataDictItemSelectionVO[]>([]);
const systemTypeLoaded = ref(false);
const showResultFeedback = computed(() => [3, 6].includes(record.value?.status ?? -1));

const isOverdue = (data: IssueDemandDetailVO) => isIssueDemandOverdue(data);

const getSystemTypeColor = (value?: number | string | null) => getIssueDemandSystemTypeColor(value);

const loadDetail = async (id: string) => {
  loading.value = true;
  try {
    const resp = await getIssueDemandDetailApi(id);
    record.value = resp.data;
  } finally {
    loading.value = false;
  }
};

const loadSystemTypeOptions = async () => {
  if (systemTypeLoaded.value) return;

  try {
    const resp = await getDictItemsByCodeApi("GSXT");
    systemTypeOptions.value = resp.data || [];
    systemTypeLoaded.value = true;
  } catch (error) {
    console.error("加载所属系统字典失败", error);
  }
};

const formatSystemType = (data?: IssueDemandDetailVO | null) => {
  if (!data) return "-";
  if (String(data.systemType) === "0" && data.otherSystem) return data.otherSystem;

  const value = data.systemType;
  if (value === null || value === undefined) return "-";

  const matchedItem = systemTypeOptions.value.find((item) => item.value === String(value));
  return matchedItem?.text || String(value);
};

const handleClose = () => {
  open.value = false;
  record.value = null;
  emit("update:open", false);
};

watch(
  () => props.open,
  (value) => {
    open.value = value;
  },
  { immediate: true }
);

watch(
  () => [props.open, props.data?.id] as const,
  async ([drawerOpen, id]) => {
    if (!drawerOpen) {
      record.value = null;
      return;
    }

    await loadSystemTypeOptions();

    if (id) {
      await loadDetail(id);
    }
  },
  { immediate: true }
);

const resolveAttachmentUrl = (attachment: AttachmentVO) => {
  if (attachment.url) {
    return /^https?:\/\//.test(attachment.url) ? attachment.url : FILE_ACCESS_URL + attachment.url;
  }
  if (attachment.path) return FILE_ACCESS_URL + attachment.path;
  return "";
};

const formatFileSize = (size?: number) => {
  if (!size && size !== 0) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};
</script>

<style scoped>
.full-span {
  grid-column: 1 / -1;
}

.title-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.urgent-icon {
  flex: 0 0 auto;
  color: #ff4d4f;
  font-size: 16px;
}

.status-value {
  display: inline-flex;
  align-self: flex-start;
  width: fit-content;
}

.status-value :deep(.ant-tag) {
  margin-inline-end: 0;
}

.system-type-value {
  display: inline-flex;
  align-self: flex-start;
  width: fit-content;
}

.system-type-value :deep(.ant-tag) {
  margin-inline-end: 0;
}

.multiline-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.7;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.attachment-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex-wrap: wrap;
}

.attachment-name {
  word-break: break-all;
}

.attachment-extra {
  color: #9ca3af;
  font-size: 12px;
}

.text-placeholder {
  color: #9ca3af;
}
</style>
