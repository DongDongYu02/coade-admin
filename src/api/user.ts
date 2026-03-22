import { request } from "@/config/axios";
import type { ApiResult, PageResult } from "@/config/axios/config";

// 查询用户列表
export function getUserListApi(param: UserQuery): Promise<ApiResult<PageResult<UserVO>>> {
    return request.get("/sys/user", param);
}

// 新增用户
export function addUserApi(data: UserForm): Promise<ApiResult<void>> {
    return request.post("/sys/user", data);
}

// 修改用户
export function updateUserApi(data: UserForm): Promise<ApiResult<void>> {
    return request.put("/sys/user", data);
}

// 删除用户
export function deleteUserApi(id: string): Promise<ApiResult<void>> {
    return request.delete(`/sys/user/${id}`);
}

// 获取用户详情
export function getUserDetailApi(id: string): Promise<ApiResult<UserVO>> {
    return request.get(`/sys/user/${id}`);
}

// 重置密码
export function resetUserPasswordApi(id: string): Promise<ApiResult<string>> {
    return request.post(`/sys/user/reset-password/${id}`);
}

export interface UserQuery {
    /** 用户名 */
    username?: string | null;
    /** 昵称 */
    nickname?: string | null;
    /** 手机号 */
    phone?: string | null;
    /** 状态 */
    status?: number | null;
    /** 创建时间 */
    createTime?: string | null;
    /** 当前页码 */
    pageNo?: number;
    /** 每页条数 */
    pageSize?: number;
}

export interface UserVO {
    /** 用户ID */
    id: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 头像 */
    avatar?: string;
    /** 手机号 */
    phone?: string;
    /** 状态 0-禁用 1-启用 */
    status: number;
    /** 角色ID列表 */
    roleIds?: string[];
    /** 角色名称列表 */
    roleNames?: string[];
    /** 创建时间 */
    createTime: string;
    /** 更新时间 */
    updateTime: string;
    /** 创建人  */
    createBy: string;
    creator:string;
    /** 更新人 */
    updateBy: string;
    updater:string;
}

export interface UserForm {
    /** ID（编辑时需要） */
    id?: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 手机号 */
    phone?: string;
    /** 头像 */
    avatar?: string;
    /** 状态 0-禁用 1-启用 */
    status?: number;
    /** 角色ID列表 */
    roleIds?: string[]; 
    /** 初始密码 */
    password?: string;
}