import { request } from "@/config/axios";
import type { ApiResult, PageResult } from "@/config/axios/config";

export function get6sReviewListApi(param: Cmt6sReviewQuery): Promise<ApiResult<PageResult<Cmt6sReviewVO>>> {
  return request.get("/cmt/6s", param);
}

export function get6sReviewDetailApi(id: string): Promise<ApiResult<Cmt6sReviewDetailVO>> {
  return request.get(`/cmt/6s/${id}`);
}

export function get6sProblemPageListApi(
  param: Cmt6sProblemPageQuery
): Promise<ApiResult<PageResult<Cmt6sReviewProblemVO>>> {
  return request.get("/cmt/6s/problem/page", param);
}

export function export6sProblemsApi(param: Cmt6sProblemPageQuery): Promise<ApiResult<void>> {
  return request.get("/cmt/6s/export/problems", param);
}

export function get6sProblemExportRecordListApi(): Promise<ApiResult<Cmt6sProblemExportRecordVO[]>> {
  return request.get("/cmt/6s/problem/export/list");
}

export interface Cmt6sReviewQuery {
  deptId?: string | null;
  responsiblePersonId?: string | null;
  status?: number | null;
  createTimeRange?: string | null;
  pageNo?: number;
  pageSize?: number;
}

export interface Cmt6sReviewVO {
  id: string;
  title: string;
  deptId?: string;
  deptName?: string;
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  status: number;
  createTime: string;
}

export interface Cmt6sProblemPageQuery {
  deptId?: string | null;
  responsiblePersonId?: string | null;
  status?: number | null;
  createTimeRange?: string | null;
  pageNo?: number;
  pageSize?: number;
}

export interface Cmt6sReviewProblemVO {
  id: string;
  reviewId?: string;
  reviewTitle?: string;
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  deptId?: string;
  deptName?: string;
  description?: string;
  suggestion?: string;
  problemImage?: string;
  rectifyImage?: string;
  assister?: string;
  assisterName?: string;
  deadline?: string;
  status?: number;
}

export interface Cmt6sProblemExportRecordVO {
  id: string;
  path?: string;
  name?: string;
  status?: number;
  createTime?: string;
  message?: string | null;
}

export interface Cmt6sAttachmentVO {
  id: string;
  name?: string;
  originName?: string;
  mime?: string;
  size?: number | string;
  path?: string;
  url?: string;
}

export interface Cmt6sProblemVO {
  id: string;
  ctrl?: number;
  description?: string;
  suggestion?: string;
  assister?: string;
  assisterName?: string;
  deadline?: string;
  images?: Cmt6sAttachmentVO[];
  rectifyResultImages?: Cmt6sAttachmentVO[];
  newImageIds?: string[];
  removedImageIds?: string[];
  fieldIsUpdate?: number;
}

export interface Cmt6sReviewDetailVO {
  id: string;
  title?: string;
  deptId?: string;
  deptName?: string;
  status: number;
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  createTime?: string;
  materials?: Cmt6sAttachmentVO[];
  problems?: Cmt6sProblemVO[];
}
