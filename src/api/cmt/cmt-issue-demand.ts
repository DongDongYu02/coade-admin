import { request } from "@/config/axios";
import type { ApiResult, PageResult } from "@/config/axios/config";

export function getIssueDemandListApi(param: IssueDemandQuery): Promise<ApiResult<PageResult<IssueDemandVO>>> {
  return request.get("/cmt/issue-demand/page", param);
}

export function getIssueDemandDetailApi(id: string): Promise<ApiResult<IssueDemandDetailVO>> {
  return request.get(`/cmt/issue-demand/${id}`);
}

export interface IssueDemandQuery {
  type: number;
  status?: number | null;
  systemType?: number | string | null;
  isOverdue?: string | null;
  dept?: string | null;
  pageNo?: number;
  pageSize?: number;
}

export interface IssueDemandVO {
  id: string;
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
  createTime: string;
  resultFeedback?: string;
  createBy?: string;
  createClient?: string;
  creator?: string;
  attachments?: AttachmentVO[];
}
