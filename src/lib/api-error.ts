import { isAxiosError } from "axios"

export const API_ERROR_CODE = {
  VALIDATION: "VALIDATION",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  BUSINESS_ERROR: "BUSINESS_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const

export type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE]

const DEFAULT_MESSAGE = "Đã có lỗi xảy ra, vui lòng thử lại."
const NETWORK_MESSAGE =
  "Không kết nối được tới máy chủ. Kiểm tra lại API đang chạy."

interface ApiErrorDetail {
  code: ApiErrorCode
  message: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readEnvelope(payload: unknown): ApiErrorDetail | undefined {
  if (!isRecord(payload) || payload.success !== false) return undefined
  if (!isRecord(payload.error)) return undefined

  const { code, message } = payload.error
  if (typeof message !== "string") return undefined

  return {
    code:
      typeof code === "string"
        ? (code as ApiErrorCode)
        : API_ERROR_CODE.INTERNAL_ERROR,
    message,
  }
}

export function getHttpStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined
}

export function getApiErrorCode(error: unknown): ApiErrorCode | undefined {
  if (!isAxiosError(error)) return undefined
  return readEnvelope(error.response?.data)?.code
}

export function getApiErrorMessage(error: unknown, fallback?: string): string {
  if (!isAxiosError(error)) {
    return fallback ?? DEFAULT_MESSAGE
  }

  const envelope = readEnvelope(error.response?.data)
  if (envelope) return envelope.message

  if (!error.response) return NETWORK_MESSAGE

  return error.message || fallback || DEFAULT_MESSAGE
}

export function isApiErrorCode(error: unknown, code: ApiErrorCode): boolean {
  return getApiErrorCode(error) === code
}

export function isAuthError(error: unknown): boolean {
  const status = getHttpStatus(error)
  return status === 401 || status === 403
}
