<template>
  <div class="page-container issue-demand-analysis-page h-full">
    <div class="analysis-hero">
      <h2 class="analysis-hero__title">优化反馈 / 需求开发统计分析</h2>
      <div class="analysis-hero__actions">
        <div class="analysis-time-select">
          <span class="analysis-time-select__label">时间范围</span>
          <a-select
            v-model:value="searchParams.timeRange"
            class="analysis-time-select__control"
            :bordered="false"
            :options="timeRangeOptions"
            @change="onTimeRangeChange"
          />
        </div>
        <a-button type="primary" class="analysis-refresh-btn" :loading="searchLoading" @click="onSearch">
          刷新数据
        </a-button>
      </div>
    </div>

    <div class="summary-grid">
      <div
        v-for="item in summaryCards"
        :key="item.key"
        class="summary-card"
        :class="{ 'is-clickable': item.routePath }"
        @click="onSummaryCardClick(item)"
      >
        <div class="summary-card__halo" :class="`is-${item.theme}`" />
        <div class="summary-card__icon" :class="`is-${item.theme}`">
          {{ item.icon }}
        </div>
        <div class="summary-card__label">{{ item.label }}</div>
        <div class="summary-card__value">{{ item.value }}</div>
      </div>
    </div>

    <div class="chart-grid">
      <section class="chart-card chart-card--trend">
        <div class="chart-card__header">
          <div>
            <h3 class="chart-card__title">上报趋势</h3>
            <p class="chart-card__desc">按筛选周期统计两类事项的提交数量变化</p>
          </div>
          <a-tag color="blue">提交数量</a-tag>
        </div>
        <div ref="trendChartRef" class="trend-chart" />
      </section>

      <section class="chart-card chart-card--status">
        <div class="chart-card__header">
          <div>
            <h3 class="chart-card__title">状态分布</h3>
            <p class="chart-card__desc">当前流程节点占比</p>
          </div>
          <a-tag color="green">有效率 {{ effectiveRateText }}</a-tag>
        </div>

        <div class="status-content">
          <div ref="statusChartRef" class="status-chart" />
          <div class="status-list">
            <div v-for="item in statusDistribution" :key="item.name" class="status-list__item">
              <span class="status-list__dot" :style="{ background: item.color }" />
              <span class="status-list__name">{{ item.name }}</span>
              <span class="status-list__value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="workflow-card">
        <div class="chart-card__header">
          <div>
            <h3 class="chart-card__title">处理节点概览</h3>
            <p class="chart-card__desc">按流程状态汇总待办压力</p>
          </div>
          <a-tag color="purple">流程</a-tag>
        </div>

        <div class="workflow-node-grid">
          <div
            v-for="item in workflowNodes"
            :key="item.key"
            class="workflow-node-card"
            :class="[`is-${item.theme}`, { 'is-clickable': item.routePath }]"
            @click="onWorkflowNodeClick(item)"
          >
            <div class="workflow-node-card__header">
              <span class="workflow-node-card__label">{{ item.label }}</span>
              <span class="workflow-node-card__badge">{{ item.badge }}</span>
            </div>
            <div class="workflow-node-card__value">{{ item.value }}</div>
            <div class="workflow-node-card__desc">
              <span>{{ item.desc }}</span>
              <a-tooltip v-if="item.tooltip" :title="item.tooltip">
                <InfoCircleOutlined class="workflow-node-card__tip" />
              </a-tooltip>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="top-rank-grid">
      <section class="chart-card system-distribution-card">
        <div class="chart-card__header">
          <div>
            <h3 class="chart-card__title">系统需求分布</h3>
            <p class="chart-card__desc">定位问题或需求集中出现的系统</p>
          </div>
          <a-tag color="blue">系统</a-tag>
        </div>

        <div class="system-list">
          <div
            v-for="item in systemDistribution"
            :key="item.name"
            class="system-list__item"
            @click="onSystemDistributionClick(item)"
          >
            <div class="system-list__name">{{ item.name }}</div>
            <div class="system-list__track">
              <div
                class="system-list__bar"
                :style="{ '--bar-width': `${getSystemDistributionPercent(item.value)}%` }"
              />
            </div>
            <div class="system-list__value">{{ item.value }}</div>
          </div>
        </div>
      </section>

      <section class="rank-card">
        <div class="chart-card__header">
          <div>
            <h3 class="chart-card__title">职员提出数 TOP3</h3>
            <p class="chart-card__desc">统计提出人维度的上报活跃度</p>
          </div>
          <a-tag color="blue">提出人</a-tag>
        </div>

        <div class="rank-list">
          <div v-for="item in staffTopList" :key="item.name" class="rank-list__item" @click="onStaffTopClick(item)">
            <div class="rank-list__index" :class="`is-rank-${item.rank}`">{{ item.rank }}</div>
            <div class="rank-list__main">
              <div class="rank-list__meta">
                <span class="rank-list__name">{{ item.name }}</span>
                <span class="rank-list__sub">{{ item.dept }}</span>
              </div>
              <div class="rank-list__track">
                <div
                  class="rank-list__bar"
                  :class="`is-rank-${item.rank}`"
                  :style="{ '--bar-width': `${getStaffTopPercent(item.value)}%` }"
                />
              </div>
            </div>
            <div class="rank-list__value">{{ item.value }}</div>
          </div>
        </div>
      </section>

      <section class="rank-card">
        <div class="chart-card__header">
          <div>
            <h3 class="chart-card__title">部门提出数 TOP3</h3>
            <p class="chart-card__desc">统计提出部门维度的需求集中度</p>
          </div>
          <a-tag color="cyan">部门</a-tag>
        </div>

        <div class="rank-list">
          <div v-for="item in deptTopList" :key="item.name" class="rank-list__item" @click="onDeptTopClick(item)">
            <div class="rank-list__index" :class="`is-rank-${item.rank}`">{{ item.rank }}</div>
            <div class="rank-list__main">
              <div class="rank-list__meta">
                <span class="rank-list__name">{{ item.name }}</span>
                <span class="rank-list__sub">有效率 {{ item.effectiveRate }}</span>
              </div>
              <div class="rank-list__track">
                <div
                  class="rank-list__bar"
                  :class="`is-rank-${item.rank}`"
                  :style="{ '--bar-width': `${getDeptTopPercent(item.value)}%` }"
                />
              </div>
            </div>
            <div class="rank-list__value">{{ item.value }}</div>
          </div>
        </div>
      </section>

    </div>

    <div class="efficiency-analysis-grid">
      <section class="analysis-card owner-task-card">
        <div class="chart-card__header">
          <div>
            <h3 class="chart-card__title">负责人任务分析</h3>
            <p class="chart-card__desc">关注任务量、未完成数、逾期风险和交付效率</p>
          </div>
          <a-tag color="orange">负责人</a-tag>
        </div>

        <div class="owner-task-table">
          <div class="owner-task-table__row is-header">
            <div>负责人</div>
            <div>任务数</div>
            <div>未完成</div>
            <div>逾期</div>
            <div>完成率</div>
          </div>
          <div
            v-for="item in ownerTaskAnalysis"
            :key="item.name"
            class="owner-task-table__row"
            @click="onOwnerTaskClick(item)"
          >
            <div class="owner-cell">
              <span class="owner-cell__avatar">{{ item.shortName }}</span>
              <span>{{ item.name }}</span>
            </div>
            <div>{{ item.taskCount }}</div>
            <div>{{ item.unfinished }}</div>
            <div>
              <span class="owner-task-table__overdue" :class="getOverdueLevelClass(item.overdue)">
                {{ item.overdue }}
              </span>
            </div>
            <div>{{ item.completionRate }}</div>
          </div>
        </div>
      </section>

      <section class="analysis-card overdue-efficiency-card">
        <div class="chart-card__header">
          <div>
            <h3 class="chart-card__title">逾期与效率分析</h3>
            <p class="chart-card__desc">开发逾期、验收逾期、平均耗时</p>
          </div>
          <a-tag :color="efficiencyRisk.color">{{ efficiencyRisk.label }}</a-tag>
        </div>

        <div class="efficiency-metric-grid">
          <div
            v-for="item in efficiencyMetrics"
            :key="item.key"
            class="efficiency-metric-card"
            :class="[`is-${item.theme}`, { 'is-clickable': item.routeQuery }]"
            @click="onEfficiencyMetricClick(item)"
          >
            <div class="efficiency-metric-card__header">
              <span>{{ item.label }}</span>
              <span class="efficiency-metric-card__badge">{{ item.badge }}</span>
            </div>
            <div class="efficiency-metric-card__value">{{ item.value }}</div>
            <div class="efficiency-metric-card__desc">{{ item.desc }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getIssueDemandEfficiencyApi,
  getIssueDemandOverviewApi,
  getIssueDemandPrincipalStatisticsApi,
  getIssueDemandProposeDeptTopApi,
  getIssueDemandProcessOverviewApi,
  getIssueDemandProposerTopApi,
  getIssueDemandSubmitTrendApi,
  getIssueDemandSystemDistributionApi,
  type IssueDemandEfficiencyVO,
  type IssueDemandOverviewVO,
  type IssueDemandPrincipalStatisticsVO,
  type IssueDemandProposeDeptTopVO,
  type IssueDemandProcessOverviewVO,
  type IssueDemandProposerTopVO,
  type IssueDemandSubmitTrendVO,
  type IssueDemandSystemDistributionVO
} from "@/api/cmt/cmt-issue-demand";
import { InfoCircleOutlined } from "@ant-design/icons-vue";
import * as echarts from "echarts";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

interface SearchParams {
  timeRange?: number;
}

const DEFAULT_TIME_RANGE = 1;
const ISSUE_DEMAND_LIST_PATH = "/issue-demand/list";
const ISSUE_DEMAND_LIST_FILTER_STORAGE_KEY = "issue-demand-list-filter";

const router = useRouter();
const searchParams = ref<SearchParams>({
  timeRange: DEFAULT_TIME_RANGE
});
const searchLoading = ref(false);
const overviewData = ref<IssueDemandOverviewVO>({});
const submitTrendData = ref<IssueDemandSubmitTrendVO[]>([]);
const processOverviewData = ref<IssueDemandProcessOverviewVO>({});
const systemDistributionData = ref<IssueDemandSystemDistributionVO[]>([]);
const proposerTopData = ref<IssueDemandProposerTopVO[]>([]);
const proposeDeptTopData = ref<IssueDemandProposeDeptTopVO[]>([]);
const principalStatisticsData = ref<IssueDemandPrincipalStatisticsVO[]>([]);
const efficiencyData = ref<IssueDemandEfficiencyVO>({});
const trendTooltipEnabled = ref(false);
const trendChartRef = ref<HTMLDivElement>();
const statusChartRef = ref<HTMLDivElement>();
let trendChart: echarts.ECharts | null = null;
let statusChart: echarts.ECharts | null = null;
let latestSearchToken = 0;
let enableTrendTooltipTimer: ReturnType<typeof window.setTimeout> | null = null;

const formatOverviewNumber = (value?: number) => String(value ?? 0);

const summaryCards = computed(() => [
  {
    key: "total",
    icon: "总",
    label: "上报总数",
    value: formatOverviewNumber(overviewData.value.totalCount),
    theme: "blue",
    routePath: ISSUE_DEMAND_LIST_PATH
  },
  {
    key: "issue",
    icon: "问",
    label: "优化反馈数",
    value: formatOverviewNumber(overviewData.value.issueFeedbackCount),
    theme: "cyan",
    routePath: ISSUE_DEMAND_LIST_PATH,
    routeQuery: { type: 1 }
  },
  {
    key: "demand",
    icon: "需",
    label: "需求开发数",
    value: formatOverviewNumber(overviewData.value.demandDevelopmentCount),
    theme: "purple",
    routePath: ISSUE_DEMAND_LIST_PATH,
    routeQuery: { type: 2 }
  },
  {
    key: "urgent",
    icon: "急",
    label: "紧急事项数",
    value: formatOverviewNumber(overviewData.value.urgentCount),
    theme: "orange",
    routePath: ISSUE_DEMAND_LIST_PATH,
    routeQuery: { isUrgent: 1 }
  },
  {
    key: "pending",
    icon: "待",
    label: "待处理数",
    value: formatOverviewNumber(overviewData.value.pendingHandleCount),
    theme: "red",
    routePath: ISSUE_DEMAND_LIST_PATH,
    routeQuery: { status: [0] }
  },
  {
    key: "processing",
    icon: "进",
    label: "处理中数",
    value: formatOverviewNumber(overviewData.value.processingCount),
    theme: "violet",
    routePath: ISSUE_DEMAND_LIST_PATH,
    routeQuery: { status: [1, 2] }
  },
  {
    key: "acceptance",
    icon: "验",
    label: "待验收数",
    value: formatOverviewNumber(overviewData.value.pendingAcceptanceCount),
    theme: "sky",
    routePath: ISSUE_DEMAND_LIST_PATH,
    routeQuery: { status: [6] }
  },
  { key: "completionRate", icon: "率", label: "完成率", value: overviewData.value.completionRateText || "0%", theme: "green" }
]);

const trendLabels = computed(() => submitTrendData.value.map((item) => item.date || "-"));
const issueTrendData = computed(() => submitTrendData.value.map((item) => item.issueCount ?? 0));
const demandTrendData = computed(() => submitTrendData.value.map((item) => item.demandCount ?? 0));

const effectiveRateText = computed(() => overviewData.value.effectiveRateText || "0%");

const statusDistribution = computed(() => [
  { name: "待处理", value: overviewData.value.pendingHandleCount ?? 0, color: "#1f75ff" },
  { name: "评估中", value: overviewData.value.assessingCount ?? 0, color: "#94a3b8" },
  { name: "开发中", value: overviewData.value.devCount ?? 0, color: "#7133d6" },
  { name: "待验收", value: overviewData.value.pendingAcceptanceCount ?? 0, color: "#ff8a16" },
  { name: "已完成", value: overviewData.value.completedCount ?? 0, color: "#18a058" },
  { name: "已作废", value: overviewData.value.voidedCount ?? 0, color: "#ff4d4f" }
]);

const onSummaryCardClick = (item: (typeof summaryCards.value)[number]) => {
  if (!item.routePath) return;

  sessionStorage.setItem(
    ISSUE_DEMAND_LIST_FILTER_STORAGE_KEY,
    JSON.stringify(item.routeQuery || {})
  );
  router.push(item.routePath);
};

const systemDistribution = computed(() =>
  systemDistributionData.value
    .map((item) => ({
      name: item.systemTypeText || "-",
      value: item.count ?? 0,
      systemType: item.systemType
    }))
    .filter((item) => item.value > 0)
);

const onSystemDistributionClick = (item: (typeof systemDistribution.value)[number]) => {
  if (item.systemType === undefined || item.systemType === null) return;

  sessionStorage.setItem(
    ISSUE_DEMAND_LIST_FILTER_STORAGE_KEY,
    JSON.stringify({ systemType: item.systemType })
  );
  router.push(ISSUE_DEMAND_LIST_PATH);
};

const staffTopList = computed(() =>
  proposerTopData.value.map((item, index) => ({
    rank: item.ranking ?? index + 1,
    name: item.proposeUserName || "-",
    proposeUserId: item.proposeUserId,
    dept: item.proposeDept || "-",
    value: item.total ?? 0
  }))
);

const onStaffTopClick = (item: (typeof staffTopList.value)[number]) => {
  if (!item.proposeUserId) return;

  sessionStorage.setItem(
    ISSUE_DEMAND_LIST_FILTER_STORAGE_KEY,
    JSON.stringify({ proposeUserId: item.proposeUserId })
  );
  router.push(ISSUE_DEMAND_LIST_PATH);
};

const deptTopList = computed(() =>
  proposeDeptTopData.value.map((item, index) => ({
    rank: item.ranking ?? index + 1,
    name: item.proposeDept || "-",
    effectiveRate: item.effectiveRateText || "0%",
    value: item.total ?? 0
  }))
);

const onDeptTopClick = (item: (typeof deptTopList.value)[number]) => {
  if (!item.name || item.name === "-") return;

  sessionStorage.setItem(
    ISSUE_DEMAND_LIST_FILTER_STORAGE_KEY,
    JSON.stringify({ proposeDept: item.name })
  );
  router.push(ISSUE_DEMAND_LIST_PATH);
};

const workflowNodes = computed(() => [
  {
    key: "pending",
    label: "待处理",
    badge: "预警",
    value: processOverviewData.value.pendingHandleCount ?? 0,
    desc: `${processOverviewData.value.pendingHandleOver72hCount ?? 0} 条超过 72 小时`,
    theme: "warning",
    routePath: ISSUE_DEMAND_LIST_PATH,
    routeQuery: { status: [0] }
  },
  {
    key: "evaluating",
    label: "评估中",
    badge: "评估",
    value: processOverviewData.value.evaluatingCount ?? 0,
    desc: `平均响应 ${processOverviewData.value.avgResponseDaysFormat || "-"}`,
    tooltip: "从创建到进入开发阶段的耗时",
    theme: "evaluate",
    routePath: ISSUE_DEMAND_LIST_PATH,
    routeQuery: { status: [1] }
  },
  {
    key: "developing",
    label: "开发中",
    badge: "开发",
    value: processOverviewData.value.developingCount ?? 0,
    desc: `计划内 ${processOverviewData.value.developingInPlanCount ?? 0} 条`,
    theme: "develop",
    routePath: ISSUE_DEMAND_LIST_PATH,
    routeQuery: { status: [2] }
  },
  {
    key: "acceptance",
    label: "待验收",
    badge: "验收",
    value: processOverviewData.value.pendingAcceptanceCount ?? 0,
    desc: `${processOverviewData.value.acceptanceOverdueCount ?? 0} 条验收逾期`,
    theme: "acceptance",
    routePath: ISSUE_DEMAND_LIST_PATH,
    routeQuery: { status: [6] }
  }
]);

const onWorkflowNodeClick = (item: (typeof workflowNodes.value)[number]) => {
  if (!item.routePath) return;

  sessionStorage.setItem(
    ISSUE_DEMAND_LIST_FILTER_STORAGE_KEY,
    JSON.stringify(item.routeQuery || {})
  );
  router.push(item.routePath);
};

const getNameInitial = (name?: string) => (name || "-").slice(0, 1);

const ownerTaskAnalysis = computed(() =>
  principalStatisticsData.value.map((item) => {
    const name = item.principalUserName || "-";
    return {
      name,
      principalUserId: item.principalUserId,
      shortName: getNameInitial(name),
      taskCount: item.total ?? 0,
      unfinished: item.unfinishedTotal ?? 0,
      overdue: item.overdueTotal ?? 0,
      completionRate: item.completionRateText || "0%"
    };
  })
);

const onOwnerTaskClick = (item: (typeof ownerTaskAnalysis.value)[number]) => {
  if (!item.principalUserId) return;

  sessionStorage.setItem(
    ISSUE_DEMAND_LIST_FILTER_STORAGE_KEY,
    JSON.stringify({ principalUserId: item.principalUserId })
  );
  router.push(ISSUE_DEMAND_LIST_PATH);
};

const efficiencyOverdueTotal = computed(
  () => (efficiencyData.value.devOverdueTotal ?? 0) + (efficiencyData.value.acceptanceOverdueTotal ?? 0)
);

const efficiencyRisk = computed(() => {
  const overdueTotal = efficiencyOverdueTotal.value;
  if (overdueTotal >= 5) return { label: "高风险", color: "red" };
  if (overdueTotal > 3) return { label: "中风险", color: "orange" };
  return { label: "低风险", color: "green" };
});

const getOverdueRiskTag = (value?: number) => {
  const count = value ?? 0;
  if (count >= 5) return { label: "高", theme: "danger" };
  if (count > 3) return { label: "中", theme: "warning" };
  return { label: "低", theme: "green" };
};

const efficiencyMetrics = computed(() => [
  {
    key: "devOverdue",
    label: "开发逾期未完成数",
    value: efficiencyData.value.devOverdueTotal ?? 0,
    desc: "超计划完成时间仍未完成",
    badge: getOverdueRiskTag(efficiencyData.value.devOverdueTotal).label,
    theme: getOverdueRiskTag(efficiencyData.value.devOverdueTotal).theme,
    routeQuery: { status: [2], isOverdue: "1" }
  },
  {
    key: "acceptanceOverdue",
    label: "验收逾期数",
    value: efficiencyData.value.acceptanceOverdueTotal ?? 0,
    desc: "完成后 24 小时未验收",
    badge: getOverdueRiskTag(efficiencyData.value.acceptanceOverdueTotal).label,
    theme: getOverdueRiskTag(efficiencyData.value.acceptanceOverdueTotal).theme,
    routeQuery: { status: [6], isAcceptanceOverdue: "1" }
  },
  {
    key: "avgResponse",
    label: "平均响应耗时",
    value: efficiencyData.value.avgResponseDurationText || "-",
    desc: "创建到进入开发阶段",
    badge: "响应",
    theme: "blue"
  },
  {
    key: "avgTotal",
    label: "平均完成耗时",
    value: efficiencyData.value.avgFinishCostDurationText || "-",
    desc: "创建到验收完成",
    badge: "效率",
    theme: "green"
  }
]);

const onEfficiencyMetricClick = (item: (typeof efficiencyMetrics.value)[number]) => {
  if (!item.routeQuery) return;

  sessionStorage.setItem(
    ISSUE_DEMAND_LIST_FILTER_STORAGE_KEY,
    JSON.stringify(item.routeQuery)
  );
  router.push(ISSUE_DEMAND_LIST_PATH);
};

const maxSystemDistributionValue = computed(
  () => Math.max(...systemDistribution.value.map((item) => item.value), 1)
);

const getSystemDistributionPercent = (value: number) =>
  Math.round((value / maxSystemDistributionValue.value) * 100);

const maxStaffTopValue = computed(() => Math.max(...staffTopList.value.map((item) => item.value), 1));
const maxDeptTopValue = computed(() => Math.max(...deptTopList.value.map((item) => item.value), 1));

const getStaffTopPercent = (value: number) => Math.round((value / maxStaffTopValue.value) * 100);
const getDeptTopPercent = (value: number) => Math.round((value / maxDeptTopValue.value) * 100);

const getOverdueLevelClass = (value: number) => {
  if (value >= 3) return "is-high";
  if (value > 0) return "is-medium";
  return "is-low";
};

const timeRangeOptions = [
  { label: "本年度", value: 1 },
  { label: "本季度", value: 2 },
  { label: "本月", value: 3 },
  { label: "本周", value: 4 }
];

const onTimeRangeChange = (value: number) => {
  searchParams.value.timeRange = value;
  onSearch();
};

const onSearch = async () => {
  const searchToken = ++latestSearchToken;
  searchLoading.value = true;
  try {
    const currentTimeRange = searchParams.value.timeRange ?? DEFAULT_TIME_RANGE;
    const query = {
      timeRange: currentTimeRange
    };
    const [
      overviewResp,
      submitTrendResp,
      processOverviewResp,
      systemDistributionResp,
      proposerTopResp,
      proposeDeptTopResp,
      principalStatisticsResp,
      efficiencyResp
    ] = await Promise.all([
      getIssueDemandOverviewApi(query),
      getIssueDemandSubmitTrendApi(query),
      getIssueDemandProcessOverviewApi(query),
      getIssueDemandSystemDistributionApi(query),
      getIssueDemandProposerTopApi(query),
      getIssueDemandProposeDeptTopApi(query),
      getIssueDemandPrincipalStatisticsApi(query),
      getIssueDemandEfficiencyApi(query)
    ]);
    if (searchToken !== latestSearchToken) return;
    overviewData.value = overviewResp.data || {};
    submitTrendData.value = submitTrendResp.data || [];
    processOverviewData.value = processOverviewResp.data || {};
    systemDistributionData.value = systemDistributionResp.data || [];
    proposerTopData.value = proposerTopResp.data || [];
    proposeDeptTopData.value = proposeDeptTopResp.data || [];
    principalStatisticsData.value = principalStatisticsResp.data || [];
    efficiencyData.value = efficiencyResp.data || {};
    await nextTick();
    renderCharts();
  } catch (error) {
    console.error("加载优化反馈 / 需求开发总览失败", error);
  } finally {
    if (searchToken === latestSearchToken) {
      searchLoading.value = false;
    }
  }
};

const getTrendChartOption = (): echarts.EChartsOption => ({
  animation: true,
  animationDuration: 800,
  animationDurationUpdate: 800,
  animationEasing: "cubicOut",
  animationEasingUpdate: "cubicOut",
  stateAnimation: {
    duration: 0
  },
  color: ["#1f75ff", "#7133d6"],
  tooltip: {
    show: trendTooltipEnabled.value,
    trigger: "axis",
    triggerOn: "mousemove|click",
    confine: true,
    enterable: false,
    transitionDuration: 0,
    axisPointer: {
      type: "line",
      animation: false,
      lineStyle: {
        color: "#cbd5e1",
        type: "dashed"
      }
    }
  },
  legend: {
    top: 0,
    left: "center",
    selectedMode: false,
    icon: "circle",
    itemWidth: 8,
    itemHeight: 8,
    textStyle: {
      color: "#475569"
    },
    data: ["优化反馈提交数", "需求开发提交数"]
  },
  grid: {
    top: 44,
    right: 28,
    bottom: 28,
    left: 40
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: trendLabels.value,
    axisTick: { show: false },
    axisLine: {
      lineStyle: {
        color: "#e2e8f0"
      }
    },
    axisLabel: {
      color: "#64748b"
    }
  },
  yAxis: {
    type: "value",
    splitNumber: 4,
    axisLabel: { show: false },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: {
      lineStyle: {
        color: "#e5e7eb"
      }
    }
  },
  series: [
    {
      name: "优化反馈提交数",
      type: "line",
      smooth: false,
      symbol: "none",
      emphasis: {
        disabled: true
      },
      lineStyle: {
        width: 4,
        color: "#1f75ff"
      },
      itemStyle: {
        color: "#1f75ff"
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgb(31 117 255 / 28%)" },
          { offset: 1, color: "rgb(31 117 255 / 0%)" }
        ])
      },
      data: issueTrendData.value
    },
    {
      name: "需求开发提交数",
      type: "line",
      smooth: false,
      symbol: "none",
      emphasis: {
        disabled: true
      },
      lineStyle: {
        width: 4,
        color: "#7133d6"
      },
      itemStyle: {
        color: "#7133d6"
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgb(113 51 214 / 22%)" },
          { offset: 1, color: "rgb(113 51 214 / 0%)" }
        ])
      },
      data: demandTrendData.value
    }
  ]
});

const getStatusChartOption = (): echarts.EChartsOption => ({
  animation: true,
  animationDuration: 800,
  animationDurationUpdate: 800,
  animationEasing: "cubicOut",
  animationEasingUpdate: "cubicOut",
  color: statusDistribution.value.map((item) => item.color),
  tooltip: {
    show: false
  },
  series: [
    {
      type: "pie",
      silent: true,
      radius: ["58%", "82%"],
      center: ["50%", "52%"],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: {
        borderWidth: 0
      },
      data: statusDistribution.value.map((item) => ({
        name: item.name,
        value: item.value
      }))
    }
  ],
  graphic: [
    {
      type: "text",
      left: "center",
      top: "45%",
      style: {
        text: effectiveRateText.value,
        fill: "#475569",
        fontSize: 18,
        fontWeight: 700,
        align: "center"
      }
    },
    {
      type: "text",
      left: "center",
      top: "55%",
      style: {
        text: "有效率",
        fill: "#475569",
        fontSize: 14,
        align: "center"
      }
    }
  ]
});

const renderCharts = () => {
  if (trendChartRef.value) {
    trendTooltipEnabled.value = false;
    if (enableTrendTooltipTimer) {
      window.clearTimeout(enableTrendTooltipTimer);
      enableTrendTooltipTimer = null;
    }
    if (!trendChart) {
      trendChart = echarts.init(trendChartRef.value);
    }
    const enableTrendTooltip = () => {
      trendTooltipEnabled.value = true;
      trendChart?.setOption(
        {
          tooltip: {
            show: true
          }
        },
        {
          notMerge: false,
          lazyUpdate: false
        }
      );
      if (enableTrendTooltipTimer) {
        window.clearTimeout(enableTrendTooltipTimer);
        enableTrendTooltipTimer = null;
      }
    };
    trendChart.off("finished");
    trendChart.on("finished", enableTrendTooltip);
    trendChart.clear();
    trendChart.setOption(getTrendChartOption(), {
      notMerge: true,
      lazyUpdate: false
    });
    enableTrendTooltipTimer = window.setTimeout(enableTrendTooltip, 1000);
  }

  if (statusChartRef.value) {
    if (!statusChart) {
      statusChart = echarts.init(statusChartRef.value);
    }
    statusChart.clear();
    statusChart.setOption(getStatusChartOption(), {
      notMerge: true,
      lazyUpdate: false
    });
  }
};

const resizeCharts = () => {
  trendChart?.resize();
  statusChart?.resize();
};

onMounted(async () => {
  await onSearch();
  window.addEventListener("resize", resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCharts);
  if (enableTrendTooltipTimer) {
    window.clearTimeout(enableTrendTooltipTimer);
  }
  trendChart?.dispose();
  statusChart?.dispose();
  trendChart = null;
  statusChart = null;
});
</script>

<style scoped>
.issue-demand-analysis-page {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.analysis-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 72px;
  border-radius: 16px;
  background: #fff;
  padding: 0 22px;
  box-shadow: 0 12px 28px rgb(15 23 42 / 8%);
}

.analysis-hero__title {
  margin: 0;
  color: #0f172a;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.5px;
}

.analysis-hero__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.analysis-time-select {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  border: 1px solid #cfe1ff;
  border-radius: 12px;
  background: rgb(255 255 255 / 86%);
  padding: 0 8px 0 12px;
  box-shadow: 0 8px 18px rgb(30 64 175 / 8%);
}

.analysis-time-select__label {
  color: #475569;
  font-size: 13px;
  white-space: nowrap;
}

.analysis-time-select__control {
  width: 116px;
  font-weight: 800;
}

.analysis-refresh-btn {
  height: 38px;
  border-radius: 12px;
  padding: 0 22px;
  font-weight: 800;
  box-shadow: 0 12px 22px rgb(22 119 255 / 24%);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 14px;
}

.summary-card {
  position: relative;
  min-height: 146px;
  overflow: hidden;
  border-radius: 16px;
  background: #fff;
  padding: 20px 18px;
  box-shadow: 0 12px 28px rgb(15 23 42 / 8%);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.summary-card.is-clickable {
  cursor: pointer;
}

.summary-card.is-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgb(37 99 235 / 14%);
}

.summary-card__halo {
  position: absolute;
  top: -38px;
  right: -28px;
  width: 92px;
  height: 92px;
  border-radius: 999px;
  opacity: 0.62;
}

.summary-card__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
}

.summary-card__label {
  position: relative;
  z-index: 1;
  margin-top: 14px;
  color: #475569;
  font-size: 13px;
}

.summary-card__value {
  position: relative;
  z-index: 1;
  margin-top: 12px;
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.is-blue {
  color: #2563eb;
  background: #dbeafe;
}

.is-cyan {
  color: #0891b2;
  background: #ccfbf1;
}

.is-purple {
  color: #7c3aed;
  background: #ede9fe;
}

.is-orange {
  color: #ea580c;
  background: #fef3c7;
}

.is-red {
  color: #ef4444;
  background: #fee2e2;
}

.is-violet {
  color: #6d28d9;
  background: #ede9fe;
}

.is-sky {
  color: #0284c7;
  background: #e0f2fe;
}

.is-green {
  color: #16a34a;
  background: #dcfce7;
}

@media (max-width: 1440px) {
  .summary-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .analysis-hero {
    align-items: flex-start;
    flex-direction: column;
    padding: 16px;
  }

  .analysis-hero__title {
    font-size: 24px;
  }

  .analysis-hero__actions {
    width: 100%;
  }

  .analysis-time-select {
    flex: 1;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.chart-grid {
  display: grid;
  grid-template-columns: minmax(520px, 1.35fr) minmax(420px, 1fr) minmax(360px, 0.95fr);
  gap: 16px;
}

.chart-card {
  min-height: 342px;
  border-radius: 16px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 12px 28px rgb(15 23 42 / 8%);
}

.chart-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.chart-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.4;
}

.chart-card__desc {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.trend-chart {
  height: 256px;
  margin-top: 10px;
}

.status-content {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  margin-top: 16px;
}

.status-chart {
  height: 224px;
}

.status-list {
  display: flex;
  flex-direction: column;
}

.status-list__item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  border-bottom: 1px solid #e5e7eb;
  color: #475569;
  font-size: 14px;
}

.status-list__item:last-child {
  border-bottom: 0;
}

.status-list__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.status-list__value {
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

@media (max-width: 1280px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .chart-card {
    padding: 18px;
  }

  .status-content {
    grid-template-columns: 1fr;
  }
}

.system-distribution-card {
  min-height: 342px;
}

.system-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
  margin-top: 22px;
}

.system-list__item {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr) 34px;
  align-items: center;
  gap: 16px;
  border-radius: 10px;
  padding: 2px 6px;
  cursor: pointer;
  transition: background 180ms ease, transform 180ms ease;
}

.system-list__item:hover {
  background: #f1f7ff;
  transform: translateX(2px);
}

.system-list__name {
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
}

.system-list__track {
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #edf2f7;
}

.system-list__bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #93c5fd 0%, #1677ff 100%);
  animation: systemBarGrow 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
  transform-origin: left center;
}

.system-list__item:nth-child(2) .system-list__bar {
  animation-delay: 90ms;
}

.system-list__item:nth-child(3) .system-list__bar {
  animation-delay: 180ms;
}

.system-list__item:nth-child(4) .system-list__bar {
  animation-delay: 270ms;
}

.system-list__item:nth-child(5) .system-list__bar {
  animation-delay: 360ms;
}

.system-list__value {
  color: #64748b;
  font-size: 14px;
  text-align: right;
}

@media (max-width: 768px) {
  .system-list__item {
    grid-template-columns: 72px minmax(0, 1fr) 30px;
    gap: 10px;
  }
}

@keyframes systemBarGrow {
  from {
    width: 0;
  }

  to {
    width: var(--bar-width);
  }
}

.top-rank-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.rank-card,
.workflow-card {
  min-height: 236px;
  border-radius: 16px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 12px 28px rgb(15 23 42 / 8%);
}

.chart-grid .workflow-card {
  min-height: 342px;
}

.top-rank-grid .system-distribution-card {
  min-height: 236px;
}

.top-rank-grid .system-list {
  min-height: 150px;
  margin-top: 18px;
}

.top-rank-grid .system-list__track {
  height: 8px;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 20px;
}

.rank-list__item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 48px;
  align-items: center;
  gap: 14px;
  border-radius: 12px;
  padding: 4px 8px;
  cursor: pointer;
  transition: background 180ms ease, transform 180ms ease;
}

.rank-list__item:hover {
  background: #f8fbff;
  transform: translateX(2px);
}

.rank-list__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  font-weight: 800;
}

.rank-list__index.is-rank-1 {
  color: #ff4d4f;
  background: #fee2e2;
}

.rank-list__index.is-rank-2 {
  color: #fa8c16;
  background: #fff1d6;
}

.rank-list__index.is-rank-3 {
  color: #1677ff;
  background: #e0f2fe;
}

.rank-list__main {
  min-width: 0;
}

.rank-list__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.rank-list__name {
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.rank-list__sub {
  color: #475569;
  font-size: 14px;
}

.rank-list__track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #edf2f7;
}

.rank-list__bar {
  height: 100%;
  border-radius: 999px;
  animation: systemBarGrow 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.rank-list__bar.is-rank-1 {
  background: linear-gradient(90deg, #fca5a5 0%, #ff4d4f 100%);
}

.rank-list__bar.is-rank-2 {
  background: linear-gradient(90deg, #fdcb6e 0%, #fa8c16 100%);
  animation-delay: 90ms;
}

.rank-list__bar.is-rank-3 {
  background: linear-gradient(90deg, #93c5fd 0%, #1677ff 100%);
  animation-delay: 180ms;
}

.rank-list__value {
  color: #0f172a;
  font-size: 24px;
  font-weight: 900;
  text-align: right;
}

.workflow-node-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.workflow-node-card {
  min-height: 88px;
  border: 1px solid #e5eaf2;
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  animation: workflowCardEnter 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.workflow-node-card.is-clickable {
  cursor: pointer;
}

.workflow-node-card.is-clickable:hover {
  border-color: #b7d8ff;
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgb(22 119 255 / 10%);
}

.workflow-node-card:nth-child(2) {
  animation-delay: 80ms;
}

.workflow-node-card:nth-child(3) {
  animation-delay: 160ms;
}

.workflow-node-card:nth-child(4) {
  animation-delay: 240ms;
}

.workflow-node-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.workflow-node-card__label {
  color: #475569;
  font-size: 14px;
}

.workflow-node-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  min-width: 40px;
  border-radius: 999px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 800;
}

.workflow-node-card__value {
  margin-top: 12px;
  color: #0f172a;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

.workflow-node-card__desc {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
}

.workflow-node-card__tip {
  color: #94a3b8;
  cursor: help;
  font-size: 13px;
}

.workflow-node-card__tip:hover {
  color: #1677ff;
}

.workflow-node-card.is-warning .workflow-node-card__badge {
  color: #ff4d4f;
  background: #fff1f0;
}

.workflow-node-card.is-evaluate .workflow-node-card__badge {
  color: #1677ff;
  background: #e6f4ff;
}

.workflow-node-card.is-develop .workflow-node-card__badge {
  color: #7c3aed;
  background: #f3e8ff;
}

.workflow-node-card.is-acceptance .workflow-node-card__badge {
  color: #fa8c16;
  background: #fff7e6;
}

.efficiency-analysis-grid {
  display: grid;
  grid-template-columns: minmax(520px, 1.35fr) minmax(420px, 1fr);
  gap: 16px;
}

.analysis-card {
  min-height: 316px;
  border-radius: 16px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 12px 28px rgb(15 23 42 / 8%);
}

.overdue-efficiency-card {
  min-height: 316px;
}

.owner-task-table {
  margin-top: 18px;
  overflow: hidden;
  border-radius: 12px;
}

.owner-task-table__row {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 0.8fr 0.7fr 0.9fr;
  align-items: center;
  min-height: 56px;
  border-bottom: 1px solid #e5eaf2;
  border-radius: 10px;
  padding: 0 12px;
  color: #0f172a;
  font-size: 14px;
  transition: background 180ms ease, transform 180ms ease;
}

.owner-task-table__row:not(.is-header) {
  cursor: pointer;
}

.owner-task-table__row:not(.is-header):hover {
  background: #f8fbff;
  transform: translateX(2px);
}

.owner-task-table__row.is-header {
  min-height: 44px;
  border-bottom: 0;
  background: #f6f8fb;
  color: #475569;
  font-weight: 800;
}

.owner-task-table__row:last-child {
  border-bottom: 0;
}

.owner-cell {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.owner-cell__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  color: #1677ff;
  background: #d7ecff;
  font-weight: 800;
}

.owner-task-table__overdue {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  border-radius: 999px;
  font-weight: 800;
}

.owner-task-table__overdue.is-high {
  color: #ff4d4f;
  background: #fff1f0;
}

.owner-task-table__overdue.is-medium {
  color: #fa8c16;
  background: #fff7e6;
}

.owner-task-table__overdue.is-low {
  color: #16a34a;
  background: #e8f8ef;
}

.efficiency-metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.efficiency-metric-card {
  min-height: 88px;
  border: 1px solid #e5eaf2;
  border-radius: 14px;
  background: #f8fafc;
  padding: 14px;
  animation: workflowCardEnter 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.efficiency-metric-card.is-clickable {
  cursor: pointer;
}

.efficiency-metric-card.is-clickable:hover {
  border-color: #bfdbfe;
  box-shadow: 0 10px 24px rgb(37 99 235 / 10%);
  transform: translateY(-2px);
}

.efficiency-metric-card:nth-child(2) {
  animation-delay: 80ms;
}

.efficiency-metric-card:nth-child(3) {
  animation-delay: 160ms;
}

.efficiency-metric-card:nth-child(4) {
  animation-delay: 240ms;
}

.efficiency-metric-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
}

.efficiency-metric-card__badge {
  flex: none;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 800;
  line-height: 20px;
}

.efficiency-metric-card.is-danger .efficiency-metric-card__badge {
  color: #ff4d4f;
  background: #fff1f0;
}

.efficiency-metric-card.is-warning .efficiency-metric-card__badge {
  color: #fa8c16;
  background: #fff7e6;
}

.efficiency-metric-card.is-blue .efficiency-metric-card__badge {
  color: #1677ff;
  background: #e6f4ff;
}

.efficiency-metric-card.is-green .efficiency-metric-card__badge {
  color: #16a34a;
  background: #e8f8ef;
}

.efficiency-metric-card__value {
  margin-top: 8px;
  color: #0f172a;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}

.efficiency-metric-card__desc {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
}

@keyframes workflowCardEnter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .top-rank-grid,
  .efficiency-analysis-grid {
    grid-template-columns: 1fr;
  }

  .workflow-node-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .efficiency-metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .rank-card,
  .workflow-card,
  .analysis-card {
    padding: 18px;
  }

  .rank-list__item {
    grid-template-columns: 30px minmax(0, 1fr) 40px;
    gap: 10px;
  }

  .workflow-node-grid {
    grid-template-columns: 1fr;
  }

  .owner-task-table {
    overflow-x: auto;
  }

  .owner-task-table__row {
    grid-template-columns: 120px 80px 80px 70px 90px;
    min-width: 440px;
  }

  .efficiency-metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
