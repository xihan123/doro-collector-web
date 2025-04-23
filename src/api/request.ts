import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {ElMessage} from 'element-plus';

const service = axios.create({
    baseURL: "/api",
    timeout: 60000,
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const res = response.data;

        // 如果接口返回的是二进制数据，直接返回
        if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
            return res;
        }

        // 如果接口返回的是错误，显示错误信息
        if (res.code && res.code !== 200) {
            ElMessage.error(res.message || 'Error');
            return Promise.reject(new Error(res.message || 'Error'));
        }

        return res;
    },
    (error) => {
        console.error('Response error:', error);
        const message = error.response?.data?.message || error.message || '网络错误';
        ElMessage.error(message);
        return Promise.reject(error);
    }
);

// 封装请求方法
export const request = {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.get(url, config);
    },

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.post(url, data, config);
    },

    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.patch(url, data, config);
    },

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.put(url, data, config);
    },

    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.delete(url, config);
    },
};

export default service;