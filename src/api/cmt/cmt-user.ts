import { request } from "@/config/axios";
import type { ApiResult, PageResult } from "@/config/axios/config";


// 查询用户列表
export function getUserListApi(param: CmtUserQuery): Promise<ApiResult<PageResult<CmtUserVO>>> {
    return request.get("/cmt/user", param);
}
// 查询用户权限
export function getUserPermissionsApi(userId: string):Promise<ApiResult<CmtUserPermissionVO[]>> {
    return request.get(`/cmt/user/${userId}/permissions`);
}
// 权限授权
export function grantPermissions(userId:string,data:CmtUserPermissionDTO):Promise<ApiResult<void>> {
    return request.post(`/cmt/user/${userId}/permissmons/grant`,data)
}
// 同步蓝凌职员数据
export function syncFromEkpApi():Promise<ApiResult<void>>{
    return request.post('/cmt/user/sync-from-ekp')
}





export interface CmtUserQuery {
    /**
     * 页码
     */
    pageNo?: number;
    /**
     * 单页条数
     */
    pageSize?: number;
    /**
     * 用户名
     */
    username?: string | null;
}

/**
 * CmtUserVO，CMT用户 VO
 */
export interface CmtUserVO {
    /**
     * 部门 ID
     */
    deptId?: string;
    /**
     * 部门名称
     */
    dept?: string;
    /**
     * 蓝凌 ID
     */
    ekpId?: string;
    /**
     * ID
     */
    id: string;
    /**
     * 手机号
     */
    phone?: string;
    /**
     * 名称
     */
    username?: string;
    /**
     * 企微 ID
     */
    weComId?: string;
}

/**
 * CmtUserPermissionDTO，CMT用户权限授权 DTO
 */
export interface CmtUserPermissionDTO {
    /**
     * 权限列表
     */
    permissions: string[];
    [property: string]: any;
}

/**
 * CmtUserPermissionVO，CMT用户权限 VO
 */
export interface CmtUserPermissionVO {
    /**
     * ID 来自数据字典
     */
    id?: string;
    /**
     * 权限名称
     */
    name?: string;
    /**
     * 权限编码
     */
    code?: string;
    [property: string]: any;
}


