import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

const service = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 二进制数据直接返回
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return res
    }

    // 后端错误码处理
    if (res.code && res.code !== 200) {
      return Promise.reject(new Error(res.message || 'Error'))
    }

    return res
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(message))
  }
)

// 封装请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.patch(url, data, config)
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  },
}
