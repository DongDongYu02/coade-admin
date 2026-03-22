import { request } from "@/config/axios";
import type { ApiResult, PageResult } from "@/config/axios/config";

// 查询角色列表
export function getRoleListApi(param: RoleQuery): Promise<ApiResult<PageResult<RoleVO>>> {
    return request.get("/sys/role", param);
}

// 新增角色
export function addRoleApi(data: RoleForm): Promise<ApiResult<void>> {
    return request.post("/sys/role", data);
}

// 修改角色
export function updateRoleApi(data: RoleForm): Promise<ApiResult<void>> {
    return request.put("/sys/role", data);
}

// 删除角色
export function deleteRoleApi(id: string): Promise<ApiResult<void>> {
    return request.delete(`/sys/role/${id}`);
}

// 获取角色已授权的权限ID列表
export function getRolePermissionIdsApi(roleId: string): Promise<ApiResult<string[]>> {
    return request.get(`/sys/role/${roleId}/permissions`);
}

// 角色授权
export function grantRolePermissionsApi(roleId: string, permissionIds: string[]): Promise<ApiResult<void>> {
    return request.put(`/sys/role/${roleId}/permissions`, { permissionIds });
}

// 角色详情
export function getRoleDetailApi(id: string): Promise<ApiResult<RoleVO>> {
    return request.get(`/sys/role/${id}`);
}
// 角色选择列表
export function getRoleSelectListApi(): Promise<ApiResult<{ id: string; name: string; status: number }[]>> {
    return request.get("/sys/role/selection");
}

export interface RoleQuery {
    /** 角色名称 */
    name?: string | null;
    /** 状态 */
    status?: number | null;
    /** 创建时间 */
    createTime?: string | null;
    pageNo?: number;
    /** 每页条数 */
    pageSize?: number;
}

export interface RoleForm {
    /** ID（编辑时需要） */
    id?: string;
    /** 角色名称 */
    name: string;
    /** 角色编码 */
    code: string;
    /** 角色描述 */
    description?: string;
    /** 状态 0-禁用 1-启用 */
    status?: number
}

export interface RoleVO {
    /** ID */
    id: string;
    /** 角色名称 */
    name: string;
    /** 角色编码 */
    code: string;
    /** 角色描述 */
    description?: string;
    /** 状态 0-禁用 1-启用 */
    status: number;
    /** 创建时间 */
    createTime: string;
    /** 更新时间 */
    updateTime: string;
    /** 创建人 */
    createBy: string;
    creator:string;
    /** 更新人 */
    updateBy: string;
    updater:string;


}
