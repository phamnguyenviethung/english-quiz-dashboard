import type {
  GetAdminModels200DataItem,
  GetAdminModels200DataItemScheduleProvider,
  GetAdminModelsCatalog200DataItem,
} from "@/apis/model"

export type AiModel = GetAdminModels200DataItem

export type CatalogModel = GetAdminModelsCatalog200DataItem

/**
 * scheduleProvider và manualProvider sinh ra 2 type riêng nhưng cùng shape, dùng
 * chung một alias để không phải viết union ở mọi chỗ.
 */
export type ProviderPreferences =
  NonNullable<GetAdminModels200DataItemScheduleProvider>

/** Ngữ cảnh chọn model — khớp ModelContext ở backend. */
export type ModelContext = "schedule" | "manual" | "reading"

/**
 * Form state cho provider: các field hay dùng giữ dạng string để bind thẳng vào
 * input, phần còn lại nằm trong `advancedJson`. Chuyển đổi ở
 * utils/provider-preferences.ts.
 */
export interface ProviderFormValues {
  order: string
  only: string
  ignore: string
  sort: string
  dataCollection: string
  allowFallbacks: boolean | null
  requireParameters: boolean | null
  zdr: boolean | null
  maxPricePrompt: string
  maxPriceCompletion: string
  advancedJson: string
}

export interface AiModelFormValues {
  key: string
  modelId: string
  isActive: boolean
  scheduleEnabled: boolean
  manualEnabled: boolean
  readingEnabled: boolean
  scheduleProvider: ProviderFormValues
  manualProvider: ProviderFormValues
  // Backend lưu normalize ở bảng riêng nhưng API vẫn nhận/trả cùng shape với 2 cái
  // trên, nên form không cần biết khác biệt đó.
  readingProvider: ProviderFormValues
}
