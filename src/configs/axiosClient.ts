import type { AxiosError, AxiosRequestConfig } from "axios"
import Axios from "axios"

import { API_PROXY_PATH, LOGIN_PATH } from "./constants.ts"

// Mọi request đi qua Vercel function ở /api/proxy — function mới là nơi giữ và
// gắn admin key. Client không cầm secret nào.
export const AXIOS_INSTANCE = Axios.create({
  baseURL: API_PROXY_PATH,
})

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Chỉ redirect khi 401 đến từ chính proxy (thiếu/hết phiên dashboard). 401
    // do API backend trả về không có header này nên để component tự xử lý.
    const needsLogin =
      error.response?.status === 401 &&
      error.response.headers["x-dashboard-auth"] === "required"

    if (needsLogin && window.location.pathname !== LOGIN_PATH) {
      window.location.href = LOGIN_PATH
    }

    return Promise.reject(error)
  }
)

export const axiosClient = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const promise = AXIOS_INSTANCE<T>({
    ...config,
    ...options,
    headers: { ...config.headers, ...options?.headers },
    params: { ...config.params, ...options?.params },
  }).then(({ data }) => data)

  return promise
}

export type ErrorType<TError> = AxiosError<TError>
export type BodyType<TBodyData> = TBodyData
