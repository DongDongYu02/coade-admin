export interface IssueDemandOverdueData {
  status?: number | null;
  planFinishTime?: string | null;
  actualFinishTime?: string | null;
  devIsOverdue?: number | null;
  acceptanceIsOverdue?: number | null;
}

export const ISSUE_DEMAND_STATUS_TEXT_MAP: Record<number, string> = {
  0: "待处理",
  1: "评估中",
  2: "开发中",
  3: "已完成",
  4: "已驳回",
  5: "已作废",
  6: "待验收"
};

export const ISSUE_DEMAND_STATUS_COLOR_MAP: Record<number, string> = {
  0: "#faad14",
  1: "#1677ff",
  2: "#13c2c2",
  3: "#52c41a",
  4: "#ff4d4f",
  5: "#8c8c8c",
  6: "#722ed1"
};

export const ISSUE_DEMAND_OVERDUE_COLOR = "#ff4d4f";
export const ISSUE_DEMAND_OVERDUE_TOOLTIP = "已逾期";

const ISSUE_DEMAND_SYSTEM_TYPE_COLOR_LIST = [
  "blue",
  "cyan",
  "green",
  "purple",
  "geekblue",
  "gold"
];

export const getIssueDemandSystemTypeColor = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return "default";
  if (String(value) === "0") return "default";

  const text = String(value);
  const hash = Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ISSUE_DEMAND_SYSTEM_TYPE_COLOR_LIST[hash % ISSUE_DEMAND_SYSTEM_TYPE_COLOR_LIST.length];
};

const FINISHED_STATUS_LIST = [3, 4, 5];

const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isIssueDemandOverdue = (data?: IssueDemandOverdueData | null) => {
  if (data?.devIsOverdue === 1 || data?.acceptanceIsOverdue === 1) return true;

  if (!data?.planFinishTime) return false;

  if (data.actualFinishTime) {
    return data.actualFinishTime > data.planFinishTime;
  }

  if (FINISHED_STATUS_LIST.includes(data.status ?? -1)) {
    return false;
  }

  return data.planFinishTime < getTodayString();
};
