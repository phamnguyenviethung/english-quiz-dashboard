import type { GetAdminModels200DataItem } from "@/apis/model"

export type AiModel = GetAdminModels200DataItem

export interface AiModelFormValues {
  key: string
  modelId: string
  isActive: boolean
}
