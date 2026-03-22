import axios, { AxiosHeaders } from "axios";
import type { AxiosInstance, AxiosError } from "axios";
import { config } from "./config";
import { message } from "ant-design-vue";
import router from "@/router"


import { useAuthStore } from "@/stores/auth";
export function createAxiosService(): AxiosInstance {
    const service = axios.create({
        baseURL: config.base_url,
        timeout: config.request_timeout,
        headers: config.default_headers,
    });

    service.interceptors.request.use(
        (req) => {
            const authStore = useAuthStore();
            const token = authStore.token;

            if (token) {
                if (!req.headers) req.headers = new AxiosHeaders();
                (req.headers as AxiosHeaders).set(config.token_header, config.token_prefix + token);
            }

            return req;
        },
        (err) => Promise.reject(err)
    );

    service.interceptors.response.use(
        (resp) => {
            const res = resp.data;
            if (res?.code === 401) {
                const authStore = useAuthStore();
                authStore.clearToken();
                const redirect = encodeURIComponent(router.currentRoute.value.fullPath);
                message.error("登录已过期，请重新登录");
                router.push(`/login?redirect=${redirect}`);
                return Promise.reject(res);
            }
            if (res?.success === false) {
                message.error(res?.message || "请求失败");
                return Promise.reject(res);
            }

            return res;
        },
        (error: AxiosError<any>) => {
            const status = error.response?.status;
            const msg =
                (error.response?.data as any)?.message ||
                error.message ||
                "网络异常";

            if (status === 401) {
                const authStore = useAuthStore();
                authStore.clearToken();
            }

            message.error(msg);
            return Promise.reject({ status, msg });
        }
    );
    return service;
}