import type {
  GetEnglishConfig200Data,
  GetEnglishConfigRecords200DataItem,
  GetEnglishConfigRecords200DataItemRecordType,
} from "@/apis/model"

import type { CONFIG_SECTIONS, CONFIG_TABS } from "./constants.ts"

export type ConfigRecord = GetEnglishConfigRecords200DataItem
export type ConfigRecordType = GetEnglishConfigRecords200DataItemRecordType
export type ConfigSnapshot = GetEnglishConfig200Data

export type ConfigTabKey = (typeof CONFIG_TABS)[number]
export type ConfigSectionKey = (typeof CONFIG_SECTIONS)[number]

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
  /** Hậu tố hiển thị cạnh ô nhập: "câu" | "bài" | "luồng" | "%"... */
  unit?: string
  /** Giá trị lưu là ratio 0..1 nhưng ô nhập hiển thị 0..100. */
  display?: "percent"
}

/**
 * Giá trị đang soạn, giữ ở dạng của editor: chuỗi cho num/str/JSON, boolean cho
 * boolean, mảng object cho arr có itemFields.
 */
export type ConfigDraft = string | boolean | Record<string, unknown>[]

export interface ConfigSectionGroup {
  section: ConfigSectionKey
  records: ConfigRecord[]
}

export interface ConfigTabGroup {
  tab: ConfigTabKey
  sections: ConfigSectionGroup[]
  records: ConfigRecord[]
}

/** Một record kèm vị trí của nó, dùng khi render list phẳng lúc search. */
export interface ConfigRecordLocation {
  record: ConfigRecord
  tab: ConfigTabKey
  section: ConfigSectionKey
}
