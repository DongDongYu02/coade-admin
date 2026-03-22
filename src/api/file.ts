import { request } from "@/config/axios";
import type { ApiResult } from "@/config/axios/config";

// 上传文件
export function uploadFileApi(file: File, fieldName = 'file', extraData?: Record<string, any>): Promise<ApiResult<FileVO>> {
    return request.upload("/sys/file/upload", file, fieldName, extraData);
}


export interface FileVO {
    name: string;
    mime?: string | null;
    size?: number | null;
    path: string;
    url: string;
}
