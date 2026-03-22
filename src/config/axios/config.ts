import type { RawAxiosRequestHeaders } from "axios";

const config: {
    base_url: string
    success_code: number
    default_headers: RawAxiosRequestHeaders
    request_timeout: number
    token_header: string
    token_prefix: string
} = {
    /**
     * api请求基础路径
     */
    base_url: import.meta.env.VITE_API_BASE_URL,

    /**
     * 接口请求超时时间
     */
    request_timeout: 30000,
    
    /**
     * success_code: 默认成功响应码
     */
    success_code: 200,


    /**
     * 默认接口请求类型
     * 可选值：application/x-www-form-urlencoded multipart/form-data
     */
    default_headers: {
        'Content-Type': 'application/json;charset=UTF-8',
    },
    token_header: 'Authorization',

    token_prefix: 'Bearer '
}

export interface ApiResult<T = any> {
  code: number | string;
  message: string;
  data: T;
  success?: boolean;
}

export interface PageResult<T = any> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export { config }