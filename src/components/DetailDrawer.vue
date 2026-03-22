<template>
  <a-drawer :title="title" :width="width" :open="open" @close="emit('update:open', false)">
    <div class="flex justify-center items-center h-full" v-if="loading">
      <a-spin />
    </div>
    <template v-else>
      <!-- 头部卡片 -->
      <div v-if="header" class="detail-header">
        <div class="header-left">
          <div v-if="header.icon || $slots.headerIcon" class="icon-wrapper">
            <slot name="headerIcon">
              <component :is="header.icon" class="header-icon" />
            </slot>
          </div>
          <div class="header-info">
            <div class="header-title">{{ header.title }}</div>
            <div v-if="header.subtitle" class="header-subtitle">{{ header.subtitle }}</div>
          </div>
        </div>
        <div v-if="header.tags?.length || $slots.headerTags" class="header-right">
          <slot name="headerTags">
            <a-tag v-for="tag in header.tags" :key="tag.text" :color="tag.color">{{ tag.text }}</a-tag>
          </slot>
        </div>
      </div>

      <!-- 详情分组 -->
      <template v-for="(group, index) in groups" :key="index">
        <div v-if="group.title" class="group-title">
          <component v-if="group.icon" :is="group.icon" />
          <span>{{ group.title }}</span>
        </div>

        <!-- 自定义内容插槽 -->
        <slot v-if="group.slot" :name="group.slot" />

        <!-- 描述列表 -->
        <a-descriptions v-else :column="group.column ?? 2" :size="group.size ?? 'default'"
          :labelStyle="{ width: labelWidth, fontWeight: 500, ...group.labelStyle }">
          <a-descriptions-item v-for="item in group.items" :key="item.field" :label="item.label" :span="item.span ?? 1">
            <!-- 自定义渲染插槽 -->
            <slot :name="item.field" :value="getValue(item.field)" :record="data">
              <!-- 默认渲染 -->
              <template v-if="item.render">
                <component :is="item.render(getValue(item.field), data)" />
              </template>
              <template v-else-if="item.type === 'tag'">
                <a-tag :color="item.tagColor?.(getValue(item.field)) ?? 'default'">
                  {{ item.tagText?.(getValue(item.field)) ?? getValue(item.field) }}
                </a-tag>
              </template>
              <template v-else-if="item.type === 'code'">
                <a-typography-text v-if="getValue(item.field)" code :copyable="item.copyable">
                  {{ getValue(item.field) }}
                </a-typography-text>
                <span v-else class="text-placeholder">{{ item.placeholder ?? '-' }}</span>
              </template>
              <template v-else-if="item.type === 'link'">
                <a v-if="getValue(item.field)" :href="String(getValue(item.field))" target="_blank">
                  {{ getValue(item.field) }}
                </a>
                <span v-else class="text-placeholder">{{ item.placeholder ?? '-' }}</span>
              </template>
              <template v-else-if="item.type === 'image'">
                <a-image v-if="getValue(item.field)" :src="getValue(item.field)" :width="item.imageWidth ?? 80" />
                <span v-else class="text-placeholder">{{ item.placeholder ?? '-' }}</span>
              </template>
              <template v-else>
                <span
                  v-if="getValue(item.field) !== undefined && getValue(item.field) !== null && String(getValue(item.field)) !== ''">
                  {{ item.format ? item.format(getValue(item.field)) : getValue(item.field) }}
                </span>
                <span v-else class="text-placeholder">{{ item.placeholder ?? '-' }}</span>
              </template>
            </slot>
          </a-descriptions-item>
        </a-descriptions>

        <!-- 卡片网格布局 -->
        <div v-if="group.grid" class="detail-grid"
          :style="{ gridTemplateColumns: `repeat(${group.gridColumns ?? 3}, 1fr)` }">
          <div v-for="item in group.gridItems" :key="item.field" class="grid-item">
            <span class="grid-label">{{ item.label }}</span>
            <slot :name="item.field" :value="getValue(item.field)" :record="data">
              <template v-if="item.type === 'tag'">
                <a-tag :color="item.tagColor?.(getValue(item.field)) ?? 'default'">
                  {{ item.tagText?.(getValue(item.field)) ?? getValue(item.field) }}
                </a-tag>
              </template>
              <template v-else>
                <span class="grid-value">{{ getValue(item.field) ?? '-' }}</span>
              </template>
            </slot>
          </div>
        </div>
      </template>
    </template>
    <!-- 底部插槽 -->
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import type { CSSProperties, Component, VNode } from 'vue'

export interface DetailHeader {
  /** 图标组件 */
  icon?: Component
  /** 标题 */
  title: string
  /** 副标题 */
  subtitle?: string
  /** 标签列表 */
  tags?: Array<{ text: string; color?: string }>
}

export interface DetailItem {
  /** 字段名 */
  field: string
  /** 标签名 */
  label: string
  /** 占据列数 */
  span?: number
  /** 类型 */
  type?: 'text' | 'tag' | 'code' | 'link' | 'image'
  /** 占位符 */
  placeholder?: string
  /** 格式化函数 */
  format?: (value: any) => string
  /** 自定义渲染函数 */
  render?: (value: any, record: any) => VNode
  /** 标签颜色函数 */
  tagColor?: (value: any) => string
  /** 标签文本函数 */
  tagText?: (value: any) => string
  /** 是否可复制（code类型） */
  copyable?: boolean
  /** 图片宽度（image类型） */
  imageWidth?: number
}

export interface DetailGridItem {
  /** 字段名 */
  field: string
  /** 标签名 */
  label: string
  /** 类型 */
  type?: 'text' | 'tag'
  /** 标签颜色函数 */
  tagColor?: (value: any) => string
  /** 标签文本函数 */
  tagText?: (value: any) => string
}

export interface DetailGroup {
  /** 分组标题 */
  title?: string
  /** 分组图标 */
  icon?: Component
  /** 列数 */
  column?: number
  /** 尺寸 */
  size?: 'default' | 'small' | 'middle'
  /** 标签样式 */
  labelStyle?: CSSProperties
  /** 描述项列表 */
  items?: DetailItem[]
  /** 使用网格布局 */
  grid?: boolean
  /** 网格列数 */
  gridColumns?: number
  /** 网格项列表 */
  gridItems?: DetailGridItem[]
  /** 自定义插槽名 */
  slot?: string
}

const props = withDefaults(defineProps<{
  /** 是否打开 */
  open: boolean
  /** 标题 */
  title?: string
  /** 宽度 */
  width?: number | string
  /** 数据 */
  data?: Record<string, any> | null
  /** 头部配置 */
  header?: DetailHeader
  /** 分组配置 */
  groups?: DetailGroup[]
  /** 标签宽度 */
  labelWidth?: string
  /** 加载中 */
  loading?: boolean
}>(), {
  title: '详情',
  width: 600,
  groups: () => [],
  loading: false
})

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
}>()

const getValue = (field: string) => {
  if (!props.data) return undefined
  // 支持嵌套字段，如 'user.name'
  return field.split('.').reduce((obj, key) => obj?.[key], props.data)
}
</script>

<style scoped>
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  border-radius: 12px;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-icon {
  font-size: 28px;
  color: #1890ff;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.header-subtitle {
  font-size: 13px;
  color: #6b7280;
  font-family: monospace;
}

.header-right {
  display: flex;
  gap: 8px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 20px 0 12px;
  padding-left: 8px;
  border-left: 3px solid #1890ff;
}

.group-title:first-of-type {
  margin-top: 16px;
}

.text-placeholder {
  color: #9ca3af;
}

.detail-grid {
  display: grid;
  gap: 16px;
  padding: 8px 0;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.grid-label {
  font-size: 13px;
  color: #6b7280;
}

.grid-value {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}
</style>
