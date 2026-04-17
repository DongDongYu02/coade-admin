<template>
  <a-drawer title="整改记录详情" :width="860" :open="open" @close="handleClose">
    <a-spin :spinning="loading">
      <div class="info-section">
        <div class="section-title">
          <ProfileOutlined />
          <span>基本信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">标题</span>
            <span class="info-value">{{ record?.title || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">状态</span>
            <div class="status-value">
              <a-tag :color="STATUS_COLOR_MAP[record?.status ?? -1] || 'default'">
                {{ STATUS_TEXT_MAP[record?.status ?? -1] || "-" }}
              </a-tag>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">部门</span>
            <span class="info-value">{{ record?.deptName || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">负责人</span>
            <span class="info-value">{{ record?.responsiblePersonName || "-" }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ record?.createTime || "-" }}</span>
          </div>
        </div>
      </div>

      <div v-if="showMaterialsSection" class="info-section">
        <div class="section-title">
          <PictureOutlined />
          <span>问题素材</span>
        </div>
        <div class="image-grid">
          <div v-for="material in record?.materials || []" :key="material.id" class="preview-image">
            <a-image :src="resolveImageUrl(material)" class="preview-image__inner" />
          </div>
          <span v-if="!record?.materials?.length" class="text-placeholder">暂无素材</span>
        </div>
      </div>

      <div v-if="showProblemsSection" class="info-section">
        <div class="section-title">
          <FileTextOutlined />
          <span>问题列表</span>
        </div>
        <div v-if="record?.problems?.length" class="problem-list">
          <div v-for="(problem, idx) in record.problems" :key="problem.id" class="problem-card">
            <div class="section-title problem-title">
              <FileTextOutlined />
              <span>问题项 {{ idx + 1 }}</span>
            </div>

            <div class="info-grid">
              <div class="info-item full-span">
                <span class="info-label">问题点</span>
                <span class="info-value">{{ problem.description || "-" }}</span>
              </div>
              <div class="info-item full-span">
                <span class="info-label">整改建议</span>
                <div class="info-value multiline-text">{{ problem.suggestion || "-" }}</div>
              </div>
              <div class="info-item">
                <span class="info-label">截止日期</span>
                <span class="info-value">{{ problem.deadline || "-" }}</span>
              </div>
              <div v-if="showAssister(problem)" class="info-item">
                <span class="info-label">协助人</span>
                <span class="info-value">{{ problem.assisterName || problem.assister || "-" }}</span>
              </div>
            </div>

            <div class="image-section">
              <div class="image-title">问题图片</div>
              <div class="image-grid">
                <div v-for="image in problem.images || []" :key="image.id" class="preview-image">
                  <a-image :src="resolveImageUrl(image)" class="preview-image__inner" />
                </div>
                <span v-if="!problem.images?.length" class="text-placeholder">暂无图片</span>
              </div>
            </div>

            <div v-if="showRectifyResult(problem)" class="image-section">
              <div class="image-title">整改结果</div>
              <div class="image-grid">
                <div
                  v-for="image in problem.rectifyResultImages || []"
                  :key="image.id"
                  class="preview-image"
                >
                  <a-image :src="resolveImageUrl(image)" class="preview-image__inner" />
                </div>
                <span v-if="!problem.rectifyResultImages?.length" class="text-placeholder">
                  暂无整改结果
                </span>
              </div>
            </div>
          </div>
        </div>
        <span v-else class="text-placeholder">暂无问题</span>
      </div>

      <div v-if="showFailedSection" class="info-section">
        <div class="section-title">
          <WarningOutlined />
          <span>分析结果</span>
        </div>
        <span class="text-placeholder">分析失败</span>
      </div>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
import {
  get6sReviewDetailApi,
  type Cmt6sAttachmentVO,
  type Cmt6sProblemVO,
  type Cmt6sReviewDetailVO
} from "@/api/cmt/cmt-6s";
import {
  FileTextOutlined,
  PictureOutlined,
  ProfileOutlined,
  WarningOutlined
} from "@ant-design/icons-vue";
import { computed, ref, watch } from "vue";

const FILE_ACCESS_URL = window.location.origin + import.meta.env.VITE_FILE_ACCESS_PATH_PREFIX;

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

const props = defineProps<{
  open: boolean;
  data?: { id?: string } | null;
}>();

const emit = defineEmits<{
  (e: "update:open", v: boolean): void;
}>();

const open = ref(false);
const loading = ref(false);
const record = ref<Cmt6sReviewDetailVO | null>(null);

const statusValue = computed(() => record.value?.status ?? -1);
const showMaterialsSection = computed(() => statusValue.value === 0);
const showProblemsSection = computed(() => [1, 2, 3].includes(statusValue.value));
const showFailedSection = computed(() => statusValue.value === 4);

const resolveImageUrl = (file?: Cmt6sAttachmentVO | null) => {
  if (!file) return "";
  if (file.url) {
    return /^https?:\/\//.test(file.url) ? file.url : FILE_ACCESS_URL + file.url;
  }
  if (file.path) return FILE_ACCESS_URL + file.path;
  return "";
};

const showAssister = (problem: Cmt6sProblemVO) => {
  return [2, 3].includes(statusValue.value) && Boolean(problem.assisterName || problem.assister);
};

const showRectifyResult = (problem: Cmt6sProblemVO) => {
  return statusValue.value === 3 && Boolean(problem.rectifyResultImages?.length);
};

const loadDetail = async (id: string) => {
  loading.value = true;
  try {
    const resp = await get6sReviewDetailApi(id);
    record.value = resp.data;
  } finally {
    loading.value = false;
  }
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

    if (id) {
      await loadDetail(id);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.full-span {
  grid-column: 1 / -1;
}

.problem-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.problem-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.multiline-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.7;
}

.problem-title {
  margin-bottom: 12px;
}

.status-value {
  align-self: flex-start;
}

.image-section {
  margin-top: 16px;
}

.image-title {
  margin-bottom: 12px;
  font-weight: 500;
  color: #1f2937;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.preview-image {
  display: flex;
  flex: 0 0 100px;
  width: 100px;
  height: 120px;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 4px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
}

.preview-image :deep(.ant-image) {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.preview-image :deep(.ant-image-img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f8fafc;
}

.text-placeholder {
  color: #9ca3af;
}
</style>
