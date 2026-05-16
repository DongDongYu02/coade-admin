import { request } from "@/config/axios";
import type { ApiResult, PageResult } from "@/config/axios/config";

export function getIssueDemandListApi(param: IssueDemandQuery): Promise<ApiResult<PageResult<IssueDemandVO>>> {
  return request.get("/cmt/issue-demand/page", param);
}

export function getIssueDemandDetailApi(id: string): Promise<ApiResult<IssueDemandDetailVO>> {
  return request.get(`/cmt/issue-demand/${id}`);
}

export function getIssueDemandOverviewApi(param: IssueDemandOverviewQuery): Promise<ApiResult<IssueDemandOverviewVO>> {
  return request.get("/cmt/issue-demand/analysis/overview", param);
}

export function getIssueDemandSubmitTrendApi(param: IssueDemandOverviewQuery): Promise<ApiResult<IssueDemandSubmitTrendVO[]>> {
  return request.get("/cmt/issue-demand/analysis/submit-trend", param);
}

export function getIssueDemandProcessOverviewApi(param: IssueDemandOverviewQuery): Promise<ApiResult<IssueDemandProcessOverviewVO>> {
  return request.get("/cmt/issue-demand/analysis/process-overview", param);
}

export function getIssueDemandSystemDistributionApi(param: IssueDemandOverviewQuery): Promise<ApiResult<IssueDemandSystemDistributionVO[]>> {
  return request.get("/cmt/issue-demand/analysis/system-distribution", param);
}

export function getIssueDemandProposerTopApi(param: IssueDemandOverviewQuery): Promise<ApiResult<IssueDemandProposerTopVO[]>> {
  return request.get("/cmt/issue-demand/analysis/proposer-top", param);
}

export function getIssueDemandProposeDeptTopApi(param: IssueDemandOverviewQuery): Promise<ApiResult<IssueDemandProposeDeptTopVO[]>> {
  return request.get("/cmt/issue-demand/analysis/propose-dept-top", param);
}

export function getIssueDemandPrincipalStatisticsApi(param: IssueDemandOverviewQuery): Promise<ApiResult<IssueDemandPrincipalStatisticsVO[]>> {
  return request.get("/cmt/issue-demand/analysis/principal-statistics", param);
}

export function getIssueDemandEfficiencyApi(param: IssueDemandOverviewQuery): Promise<ApiResult<IssueDemandEfficiencyVO>> {
  return request.get("/cmt/issue-demand/analysis/efficiency", param);
}

export interface IssueDemandQuery {
  type?: number | null;
  status?: number | string | null;
  systemType?: number | string | null;
  isUrgent?: number | null;
  isOverdue?: string | null;
  isAcceptanceOverdue?: string | null;
  proposeUserId?: string | null;
  principalUserId?: string | null;
  dept?: string | null;
  pageNo?: number;
  pageSize?: number;
}

export interface IssueDemandOverviewQuery {
  timeRange: number;
}

export interface IssueDemandOverviewVO {
  totalCount?: number;
  issueFeedbackCount?: number;
  demandDevelopmentCount?: number;
  urgentCount?: number;
  pendingHandleCount?: number;
  assessingCount?: number;
  devCount?: number;
  processingCount?: number;
  pendingAcceptanceCount?: number;
  completedCount?: number;
  voidedCount?: number;
  completionRate?: number;
  completionRateText?: string;
  effectiveRateText?: string;
}

export interface IssueDemandSubmitTrendVO {
  date?: string;
  issueCount?: number;
  demandCount?: number;
}

export interface IssueDemandProcessOverviewVO {
  pendingHandleCount?: number;
  pendingHandleOver72hCount?: number;
  evaluatingCount?: number;
  avgResponseDays?: number;
  avgResponseDaysFormat?: string;
  developingCount?: number;
  developingInPlanCount?: number;
  pendingAcceptanceCount?: number;
  acceptanceOverdueCount?: number;
}

export interface IssueDemandSystemDistributionVO {
  systemType?: number;
  systemTypeText?: string;
  count?: number;
}

export interface IssueDemandProposerTopVO {
  proposeUserId?: string;
  proposeUserName?: string;
  proposeDept?: string;
  total?: number;
  ranking?: number;
}

export interface IssueDemandProposeDeptTopVO {
  proposeDept?: string;
  total?: number;
  validTotal?: number;
  invalidTotal?: number;
  effectiveRate?: number;
  effectiveRateText?: string;
  ranking?: number;
}

export interface IssueDemandPrincipalStatisticsVO {
  principalUserId?: string;
  principalUserName?: string;
  total?: number;
  unfinishedTotal?: number;
  overdueTotal?: number;
  completionRate?: number;
  completionRateText?: string;
}

export interface IssueDemandEfficiencyVO {
  devOverdueTotal?: number;
  acceptanceOverdueTotal?: number;
  avgResponseDurationText?: string;
  avgFinishCostDurationText?: string;
}

export interface IssueDemandVO {
  id: string;
  serialNo?: string;
  title: string;
  type: number;
  systemType: number;
  otherSystem?: string;
  proposeDept: string;
  proposeUser: string;
  proposeUserName: string;
  expectedFinishTime?: string;
  principalUserId?: string;
  principalUserName?: string;
  status: number;
  planFinishTime?: string;
  actualFinishTime?: string;
  devCostTime?: string;
  devIsOverdue?: number;
  acceptanceIsOverdue?: number;
  totalCostTime?: string;
  isUrgent?: number;
  createTime: string;
}

export interface AttachmentVO {
  id: string;
  name: string;
  originName?: string;
  mime?: string;
  size?: number;
  path?: string;
  url?: string;
}

export interface IssueDemandDetailVO {
  id: string;
  serialNo?: string;
  title: string;
  type: number;
  systemType: number;
  otherSystem?: string;
  description?: string;
  proposeDept: string;
  proposeUserId?: string;
  proposeUserName?: string;
  expectedFinishTime?: string;
  principalUserId?: string;
  principalUserName?: string;
  status: number;
  planFinishTime?: string;
  actualFinishTime?: string;
  devCostTime?: string;
  devIsOverdue?: number;
  acceptanceIsOverdue?: number;
  totalCostTime?: string;
  isUrgent?: number;
  createTime: string;
  resultFeedback?: string;
  createBy?: string;
  createClient?: string;
  creator?: string;
  attachments?: AttachmentVO[];
  feedbackAttachments?: AttachmentVO[];
}
