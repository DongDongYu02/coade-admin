import { request } from "@/config/axios";
import type { ApiResult, PageResult } from "@/config/axios/config";

export function getUserListApi(param: CmtUserQuery): Promise<ApiResult<PageResult<CmtUserVO>>> {
  return request.get("/cmt/user", param);
}

export function getUserSelectionApi(): Promise<ApiResult<CmtUserSelectionVO[]>> {
  return request.get("/cmt/user/selection");
}

export function getUserPermissionsApi(userId: string): Promise<ApiResult<CmtUserPermissionVO[]>> {
  return request.get(`/cmt/user/${userId}/permissions`);
}

export function grantPermissions(
  userId: string,
  data: CmtUserPermissionDTO
): Promise<ApiResult<void>> {
  return request.post(`/cmt/user/${userId}/permissmons/grant`, data);
}

export function syncFromEkpApi(): Promise<ApiResult<void>> {
  return request.post("/cmt/user/sync-from-ekp");
}

export interface CmtUserQuery {
  pageNo?: number;
  pageSize?: number;
  username?: string | null;
}

export interface CmtUserVO {
  deptId?: string;
  dept?: string;
  ekpId?: string;
  id: string;
  phone?: string;
  username?: string;
  weComId?: string;
}

export interface CmtUserSelectionVO {
  id: string;
  ekpId?: string;
  name?: string;
}

export interface CmtUserPermissionDTO {
  permissions: string[];
  [property: string]: any;
}

export interface CmtUserPermissionVO {
  id?: string;
  name?: string;
  code?: string;
  [property: string]: any;
}
