import { request } from "@/config/axios";
import type { ApiResult, PageResult } from "@/config/axios/config";

export function getCleaningAreaListApi(
  param: CmtCleaningAreaQuery
): Promise<ApiResult<PageResult<CmtCleaningAreaVO>>> {
  return request.get("/cmt/cleaning-area", param);
}

export function addCleaningAreaApi(data: CmtCleaningAreaDTO): Promise<ApiResult<void>> {
  return request.post("/cmt/cleaning-area", data);
}

export function updateCleaningAreaApi(data: CmtCleaningAreaDTO): Promise<ApiResult<void>> {
  return request.put("/cmt/cleaning-area", data);
}

export function deleteCleaningAreaApi(id: string): Promise<ApiResult<void>> {
  return request.delete(`/cmt/cleaning-area/${id}`);
}

export function getCleaningRecordListApi(
  param: CmtCleaningRecordQuery
): Promise<ApiResult<PageResult<CmtCleaningRecordVO>>> {
  return request.get("/cmt/cleaning-records", param);
}

export interface CmtCleaningAreaQuery {
  name?: string | null;
  principalUserId?: string | null;
  pageNo?: number;
  pageSize?: number;
}

export interface CmtCleaningAreaDTO {
  id?: string;
  name: string;
  principalUserId: string;
  rule?: string | null;
  remark?: string | null;
}

export interface CmtCleaningAreaVO {
  id: string;
  name?: string;
  areaName?: string;
  principalUserId?: string;
  principalUserName?: string;
  rule?: string;
  remark?: string;
  createTime?: string;
}

export interface CmtCleaningRecordQuery {
  areaId?: string | null;
  principalUserId?: string | null;
  pageNo?: number;
  pageSize?: number;
}

export interface CmtCleaningAttachmentVO {
  id?: string;
  name?: string;
  mime?: string;
  size?: number;
  path?: string;
  url?: string;
}

export interface CmtCleaningRecordVO {
  id: string;
  areaId?: string;
  areaName?: string;
  principalUserId?: string;
  principalUserName?: string;
  createTime?: string;
  attachments?: CmtCleaningAttachmentVO[];
}
