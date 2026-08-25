import type {
  GetAdminReadings200DataItemsItem,
  GetAdminReadingsBuckets200DataBucketsItem,
  GetAdminReadingsBuckets200DataSummary,
  GetAdminReadingsModels200DataItem,
  GetAdminReadingsSort,
  GetAdminReadingsType,
  PostAdminReadingsGenerate200DataPassage,
  PostAdminReadingsGenerate200DataUsage,
  PostAdminReadingsRefillBodyOneScope,
} from "@/apis/model"

import type { EngLevel } from "@/features/quiz/types.ts"

export type ReadingPassage = GetAdminReadings200DataItemsItem
export type ReadingPassagesSort = GetAdminReadingsSort
export type ReadingModelStat = GetAdminReadingsModels200DataItem
export type ReadingRefillScope = PostAdminReadingsRefillBodyOneScope
export type ReadingType = GetAdminReadingsType

export type GeneratedPassage = PostAdminReadingsGenerate200DataPassage
export type GeneratedPassageUsage = PostAdminReadingsGenerate200DataUsage

export type ReadingBucket = GetAdminReadingsBuckets200DataBucketsItem
export type ReadingBucketSummary = GetAdminReadingsBuckets200DataSummary

/** Chiều lọc bucket. Mảng rỗng = không lọc chiều đó (khớp semantics của API). */
export interface ReadingBucketFilter {
  cefrLevels: EngLevel[]
  topicIds: number[]
  types: ReadingType[]
}

export interface ReadingRefillInput extends ReadingBucketFilter {
  models: string[]
  scope: ReadingRefillScope
  countPerBucket?: number
  /** Chỉ gửi khi admin bỏ tick bucket trong preview; undefined = lấy hết theo filter. */
  bucketKeys?: string[]
}

/** Cột sort được ở table — map 1-1 với các cặp `*_asc`/`*_desc` mà API nhận. */
export type ReadingSortableColumn = "id" | "wordCount" | "createdAt"
