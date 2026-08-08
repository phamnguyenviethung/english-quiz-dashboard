import type { ProviderFormValues, ProviderPreferences } from "../types.ts"

/** Các key được điều khiển bằng control riêng; phần còn lại đi qua ô JSON nâng cao. */
const STRUCTURED_KEYS = [
  "order",
  "only",
  "ignore",
  "sort",
  "dataCollection",
  "allowFallbacks",
  "requireParameters",
  "zdr",
  "maxPrice",
] as const

export const EMPTY_PROVIDER_FORM: ProviderFormValues = {
  order: "",
  only: "",
  ignore: "",
  sort: "",
  dataCollection: "",
  allowFallbacks: null,
  requireParameters: null,
  zdr: null,
  maxPricePrompt: "",
  maxPriceCompletion: "",
  advancedJson: "",
}

function listToText(value: string[] | undefined): string {
  return value?.join(", ") ?? ""
}

function textToList(value: string): string[] | undefined {
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
  return items.length > 0 ? items : undefined
}

export function toProviderFormValues(
  provider: ProviderPreferences | null | undefined
): ProviderFormValues {
  if (!provider) return EMPTY_PROVIDER_FORM

  // Giữ lại mọi key không có control riêng để không âm thầm nuốt mất khi lưu.
  const rest = Object.fromEntries(
    Object.entries(provider).filter(
      ([key]) =>
        !STRUCTURED_KEYS.includes(key as (typeof STRUCTURED_KEYS)[number])
    )
  )

  return {
    order: listToText(provider.order),
    only: listToText(provider.only),
    ignore: listToText(provider.ignore),
    sort: provider.sort ?? "",
    dataCollection: provider.dataCollection ?? "",
    allowFallbacks: provider.allowFallbacks ?? null,
    requireParameters: provider.requireParameters ?? null,
    zdr: provider.zdr ?? null,
    maxPricePrompt: provider.maxPrice?.prompt ?? "",
    maxPriceCompletion: provider.maxPrice?.completion ?? "",
    advancedJson:
      Object.keys(rest).length > 0 ? JSON.stringify(rest, null, 2) : "",
  }
}

export function parseAdvancedJson(
  value: string
):
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; message: string } {
  const trimmed = value.trim()
  if (!trimmed) return { ok: true, value: {} }

  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return { ok: false, message: "JSON phải là một object." }
    }
    return { ok: true, value: parsed as Record<string, unknown> }
  } catch {
    return { ok: false, message: "JSON không hợp lệ." }
  }
}

/**
 * Form → payload. Trả `null` khi admin không cấu hình gì để backend lưu NULL thay
 * vì một object rỗng vô nghĩa.
 */
export function toProviderPayload(
  values: ProviderFormValues
): ProviderPreferences | null {
  const advanced = parseAdvancedJson(values.advancedJson)
  const base: Record<string, unknown> = advanced.ok ? { ...advanced.value } : {}

  const order = textToList(values.order)
  const only = textToList(values.only)
  const ignore = textToList(values.ignore)
  const sort = values.sort.trim()
  const maxPricePrompt = values.maxPricePrompt.trim()
  const maxPriceCompletion = values.maxPriceCompletion.trim()

  if (order) base.order = order
  if (only) base.only = only
  if (ignore) base.ignore = ignore
  if (sort) base.sort = sort
  if (values.dataCollection) base.dataCollection = values.dataCollection
  if (values.allowFallbacks !== null)
    base.allowFallbacks = values.allowFallbacks
  if (values.requireParameters !== null)
    base.requireParameters = values.requireParameters
  if (values.zdr !== null) base.zdr = values.zdr

  if (maxPricePrompt || maxPriceCompletion) {
    base.maxPrice = {
      ...(maxPricePrompt ? { prompt: maxPricePrompt } : {}),
      ...(maxPriceCompletion ? { completion: maxPriceCompletion } : {}),
    }
  }

  return Object.keys(base).length > 0 ? base : null
}

/** Đếm số tuỳ chọn đang bật để hiển thị badge tóm tắt trên bảng/tab. */
export function countProviderOptions(
  provider: ProviderPreferences | null | undefined
): number {
  return provider ? Object.keys(provider).length : 0
}
