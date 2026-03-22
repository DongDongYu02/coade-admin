import { request } from "@/config/axios";
import type { ApiResult } from "@/config/axios/config";

// 获取系统设置
export function getSystemSettingApi(): Promise<ApiResult<SystemSettingVO>> {
    return request.get("/sys/config/setting");
}

// 保存系统设置
export function saveSystemSettingApi(data: ConfigDTO): Promise<ApiResult<void>> {
    return request.post("/sys/config", data);
}

export interface SystemSettingVO {
    /** 系统名称 */
    systemName: string;
    /** 系统LOGO */
    systemLogo: string;
}

export interface ConfigDTO {
   configs:{key: string, value: string}[]
}
