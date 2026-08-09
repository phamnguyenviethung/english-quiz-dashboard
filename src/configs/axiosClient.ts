import type { AxiosError, AxiosRequestConfig } from "axios"
import Axios from "axios"

import { clearSessionToken, getSessionToken } from "./authClient.ts"
import { env } from "./env.ts"

export const LOGIN_PATH = "/login"

export const AXIOS_INSTANCE = Axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
})

AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = getSessionToken()
  if (token) config.headers.set("Authorization", `Bearer ${token}`)
  return config
})

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      clearSessionToken()
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== LOGIN_PATH
      ) {
        window.location.href = LOGIN_PATH
      }
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
