import { request } from "@/config/axios";
import type { ApiResult, PageResult } from "@/config/axios/config";

export function getAttendMonthDataApi(
  params: CmtAttendMonthDataQuery
): Promise<ApiResult<PageResult<AttendMonthDataVO>>> {
  return request.get("/cmt/attend/user/month/attend", buildAttendMonthSearchParams(params));
}

export function exportAttendMonthDataApi(
  params: CmtAttendMonthDataExportQuery
): Promise<ApiResult<void>> {
  return request.get("/cmt/attend/user/month/attend/export", buildAttendMonthSearchParams(params));
}

export function getAttendExportRecordListApi(): Promise<ApiResult<CmtAttendExportRecordVO[]>> {
  return request.get("/cmt/attend/export/list");
}

const buildAttendMonthSearchParams = (params: CmtAttendMonthDataExportQuery & {
  pageNo?: number;
  pageSize?: number;
}) => {
  const searchParams = new URLSearchParams();
  params.userIds?.forEach((userId) => searchParams.append("userIds", userId));
  searchParams.append("year", params.year);
  searchParams.append("month", params.month);
  if (params.dept) searchParams.append("dept", params.dept);
  if (params.pageNo !== undefined) searchParams.append("pageNo", String(params.pageNo));
  if (params.pageSize !== undefined) searchParams.append("pageSize", String(params.pageSize));

  return searchParams;
};

export interface CmtAttendMonthDataExportQuery {
  userIds: string[];
  year: string;
  month: string;
  dept?: string | null;
}

export interface CmtAttendMonthDataQuery extends CmtAttendMonthDataExportQuery {
  pageNo?: number;
  pageSize?: number;
}

export interface AttendMonthDataVO {
  userId?: string;
  username?: string;
  weComId?: string;
  dept?: string;
  attendDays?: number | string;
  attendDaysText?: string;
  leaveDays?: number | string;
  leaveDaysText?: string;
  bizTripDaysText?: string;
  lateCount?: number | string;
  lateDuration?: number | string;
  earlyCount?: number | string;
  earlyDuration?: number | string;
  overtimeDuration?: string;
  shortages?: number | string;
  dayCases?: AttendDayCaseVO[];
}

export interface AttendDayCaseVO {
  day?: number;
  data?: string[];
}

export interface CmtAttendExportRecordVO {
  id: string;
  path?: string;
  name?: string;
  status?: number;
  createTime?: string;
  message?: string | null;
}
