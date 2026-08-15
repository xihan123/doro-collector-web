import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

const service = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 二进制数据直接返回
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return res
    }

    // 后端错误通过 HTTP 状态码返回(FastAPI HTTPException),
    // 业务层的 success 字段由调用方判断
    return res
  },
  (error) => {
    const data = error.response?.data
    let message: string
    if (error.code === 'ECONNABORTED') {
      message = '请求超时,请稍后重试'
    } else if (Array.isArray(data?.detail)) {
      // FastAPI 422 参数校验错误的 detail 是对象数组
      message = data.detail.map((item: { msg?: string }) => item?.msg).filter(Boolean).join('; ') || '请求参数错误'
    } else {
      message = data?.message || data?.detail || error.message || '网络错误'
    }
    return Promise.reject(new Error(message))
  }
)

// 封装请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // 拦截器已把响应解包为 response.data,与 axios 声明的返回类型不符,只能断言
    return service.get(url, config) as Promise<T>
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config) as Promise<T>
  },
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.patch(url, data, config) as Promise<T>
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config) as Promise<T>
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config) as Promise<T>
  },
}
