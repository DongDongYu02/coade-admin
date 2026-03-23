import { request } from "@/config/axios";
import type { ApiResult } from "@/config/axios/config";

// 查询权限选择列表
export function getPermissionSelectionApi(): Promise<ApiResult<{ id: string; text: string }[]>> {
    return request.get('/cmt/permission/selection');
}