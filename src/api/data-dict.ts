import { request } from "@/config/axios";
import type { ApiResult, PageResult } from "@/config/axios/config";

// 查询列表
export function getDataDictListApi(param: DataDictQuery): Promise<ApiResult<PageResult<DataDictVO>>> {
    return request.get("/sys/data-dict", param);
}

// 新增
export function addDataDictApi(data: { name: string; code: string; sort: number }): Promise<ApiResult<void>> {
    return request.post("/sys/data-dict", data);
}

// 修改
export function updateDataDictApi(data: DataDictForm): Promise<ApiResult<void>> {
    return request.put("/sys/data-dict", data);
}

// 删除
export function deleteDataDictApi(id: string): Promise<ApiResult<void>> {
    return request.delete(`/sys/data-dict/${id}`);
}

// 详情
export function getDataDictDetailApi(id: string): Promise<ApiResult<DataDictVO>> {
    return request.get(`/sys/data-dict/${id}`);
}

// 获取字典项列表
export function getDataDictItemsApi(id: string): Promise<ApiResult<DataDictItemVO[]>> {
    return request.get(`/sys/data-dict/${id}/items`);
}

// 新增字典项
export function addDataDictItemApi(data: DataDictItemForm): Promise<ApiResult<void>> {
    return request.post(`/sys/data-dict/${data.dataDictId}/item`, data);
}

// 修改字典项
export function updateDataDictItemApi(data: DataDictItemForm): Promise<ApiResult<void>> {
    return request.put(`/sys/data-dict/${data.dataDictId}/item`, data);
}  

// 删除字典项
export function deleteDataDictItemApi(itemId: string): Promise<ApiResult<void>> {
    return request.delete(`/sys/data-dict/item/${itemId}`);
}




export interface DataDictItemVO {
    /** 字典项 ID */
    id: string
    /** 字典 ID */
    dataDictId: string
    /** 字典项名称 */
    text: string
    /** 字典项值 */
    value: string
    /** 排序 */
    sort: number
}

export interface DataDictItemForm {
    /** 字典项 ID（编辑时需要） */
    id?: string;
    /** 字典 ID */
    dataDictId: string;
    /** 字典项名称 */
    text: string;
    /** 字典项值 */
    value: string;
    /** 排序 */
    sort: number;
}


export interface DataDictQuery {
    /** 字典名称 */
    name?: string | null;

    /** 字典编码 */
    code?: string | null;

    pageNo?: number;
    /** 每页条数 */
    pageSize?: number;
}

export interface DataDictForm {
    /** ID（编辑时需要） */
    id?: string;
    /** 字典名称 */
    name: string;
    /** 字典编码 */
    code: string;
    /** 排序 */
    sort: number;
}


export interface DataDictVO {
    /** ID */
    id: string;
    /** 字典名称 */
    name: string;
    /** 字典编码 */
    code: string;
    /** 排序 */
    sort: number;
    /** 创建时间 */
    createTime: string;
    /** 更新时间 */
    updateTime: string;
    /** 创建人 */
    createBy: string;
    creator: string;
    /** 更新人 */
    updateBy: string;
    updater: string;
}
