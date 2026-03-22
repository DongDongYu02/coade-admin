import { request } from "@/config/axios";
import type { ApiResult } from "@/config/axios/config";
import type { PermissionNode } from "@/router/dynamic";

// 用户登录
export function loginApi(data: { username: string; password: string }) {
  return request.post("/sys/auth/login", data);
}

// 用户信息
export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar?: string
}

// 获取用户权限
export function getUserPermissionsApi(): Promise<ApiResult<{
  index: string
  permissions: PermissionNode[]
  authCodes: string[]
  user: UserInfo
}>> {
  return request.get("/sys/auth/user/permissions");
}

// 用户登出
export function logoutApi() {
  return request.post("/sys/auth/logout");
}

// 修改密码
export function changePasswordApi(data: { oldPassword: string; newPassword: string }) {
  return request.post("/sys/auth/change-password", data);
}