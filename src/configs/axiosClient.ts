import type { AxiosError, AxiosRequestConfig } from "axios"
import Axios from "axios"

export const AXIOS_INSTANCE = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export const axiosClient = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
  }).then(({ data }) => data)

  return promise
}

export type ErrorType<TError> = AxiosError<TError>
export type BodyType<TBodyData> = TBodyData
