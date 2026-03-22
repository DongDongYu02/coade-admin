import { request } from "@/config/axios";

// 查询权限列表
export function getPermissionTreeApi(param: PermissionQuery): Promise<{ data: PermissionVO[] }> {
    return request.get("/sys/permission", param);
}

// 新增权限
export function createPermissionApi(data: PermissionDTO) {
    return request.post("/sys/permission", data);
}

// 更新权限
export function updatePermissionApi(data: PermissionDTO) {
    return request.put(`/sys/permission`, data);
}

// 更新权限状态
export function updatePermissionStatusApi(data: PermissionUpdateStatusDTO) {
    return request.put(`/sys/permission/status/${data.id}/${data.status}`);
}

// 获取权限树下拉选项
export function getPermissionTreeSelectApi(param: PermissionTreeQuery): Promise<{ data: PermissionTreeSelectVO[] }> {
    return request.get("/sys/permission/tree-selection", param);
}

// 删除权限
export function deletePermissionApi(id: string) {
    return request.delete(`/sys/permission/${id}`);
}

// 详情
export function getPermissionDetailApi(id: string): Promise<{ data: PermissionVO }> {
    return request.get(`/sys/permission/${id}`);
}

export interface PermissionQuery {
    /** 权限名称 */
    name?: string | null;
}

export interface PermissionTreeQuery {
    /** 包含的权限类型 */
    includeTypes?: number[];
}


export interface PermissionDTO {
    /** ID */
    id?: string;
    /** 权限名称 */
    name: string;
    /** 上级 ID */
    pid?: string;
    /** 路由地址 */
    path?: string;
    /** 重定向地址 */
    redirect?: string;
    /** 组件路径 */
    component?: string;
    /** 权限编码 */
    authCode?: string;
    /** 权限类型 */
    type: number;
    /** 图标 */
    icon?: string;
    /** 状态 0禁用 1启用 */
    status?: number;
    /** 是否固定标签栏 0否 1是 */
    affix?: number;
    /** 是否缓存页面 0否 1是 */
    keepAlive?: number;
    /** 是否隐藏 0否 1是 */
    hidden?: number;
    /** 排序 */
    sort?: number;
}


export interface PermissionUpdateStatusDTO {
    /** 状态 0禁用 1启用 */
    status: number;
    /** ID */
    id: string;
}

/** SysPermissionVO */
export interface PermissionVO {
    /** ID */
    id: string
    /** 上级 ID */
    pid: string
    /** 权限名称 */
    name: string
    /** 路由地址 */
    path: string
    /** 重定向地址 */
    redirect: string
    /** 页面组件 */
    component: string
    /** 权限标识 */
    authCode: string
    /** 权限类型 1目录 2菜单 3按钮 */
    type: 1 | 2 | 3
    /** 图标 */
    icon: string
    /** 状态 0禁用 1启用 */
    status: 0 | 1
    /** 排序 */
    sort: number
    /** 是否固定标签栏 0否 1是 */
    affix?: number;
    /** 是否缓存页面 0否 1是 */
    keepAlive?: number;
    /** 是否隐藏 0否 1是 */
    hidden?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
    /** 创建人   */
    createBy?: string;
    /** 更新人 */
    updateBy?: string;
}


export interface PermissionTreeSelectVO {
    /** ID */
    id: string;
    /** 权限名称 */
    name: string;
    /** 子节点 */
    children?: PermissionTreeSelectVO[];
}


