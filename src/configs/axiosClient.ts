import type { AxiosError, AxiosRequestConfig } from "axios"
import Axios from "axios"

import { env } from "./env.ts"

export const AXIOS_INSTANCE = Axios.create({
  baseURL: env.apiBaseUrl,
})

AXIOS_INSTANCE.interceptors.request.use((config) => {
  if (env.adminApiKey) {
    config.headers.set("x-admin-key", env.adminApiKey)
    config.headers.set("Authorization", `Bearer ${env.adminApiKey}`)
  }
  return config
})

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
