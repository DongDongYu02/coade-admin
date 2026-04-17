export interface IssueDemandOverdueData {
  status?: number | null;
  planFinishTime?: string | null;
  actualFinishTime?: string | null;
}

const FINISHED_STATUS_LIST = [3, 4, 5];

const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isIssueDemandOverdue = (data?: IssueDemandOverdueData | null) => {
  if (!data?.planFinishTime) return false;

  if (data.actualFinishTime) {
    return data.actualFinishTime > data.planFinishTime;
  }

  if (FINISHED_STATUS_LIST.includes(data.status ?? -1)) {
    return false;
  }

  return data.planFinishTime < getTodayString();
};
