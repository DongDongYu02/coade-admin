import type { ApiResult } from "./config";
import { createAxiosService } from "./service";

const service = createAxiosService();

export default service;

export const request = {
  get: <T = ApiResult>(url: string, params?: any) =>
    service.get<any, T>(url, { params }),

  post: <T = ApiResult>(url: string, data?: any) =>
    service.post<any, T>(url, data),

  put: <T = ApiResult>(url: string, data?: any) =>
    service.put<any, T>(url, data),

  delete: <T = ApiResult>(url: string, params?: any) =>
    service.delete<any, T>(url, { params }),

  /** 上传文件 */
  upload: <T = ApiResult<string>>(url: string, file: File, fieldName = 'file', extraData?: Record<string, any>) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    if (extraData) {
      Object.entries(extraData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    return service.post<any, T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};
