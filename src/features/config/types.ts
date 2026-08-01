import type {
  GetEnglishConfig200Data,
  GetEnglishConfigRecords200DataItem,
  GetEnglishConfigRecords200DataItemRecordType,
} from "@/apis/model"

export type ConfigRecord = GetEnglishConfigRecords200DataItem
export type ConfigRecordType = GetEnglishConfigRecords200DataItemRecordType
export type ConfigSnapshot = GetEnglishConfig200Data

export interface ConfigFieldSchema {
  type?: ConfigRecordType
  label?: string
  description?: string
  min?: number
  max?: number
  step?: number
  integer?: boolean
  multiline?: boolean
  placeholder?: string
  options?: string[]
  itemFields?: Record<string, ConfigFieldSchema>
}

/**
 * Giá trị đang soạn, giữ ở dạng của editor: chuỗi cho num/str/JSON, boolean cho
 * boolean, mảng object cho arr có itemFields.
 */
export type ConfigDraft = string | boolean | Record<string, unknown>[]

export interface ConfigCategoryGroup {
  category: string
  records: ConfigRecord[]
}
