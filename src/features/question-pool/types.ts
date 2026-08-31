import type {
  GetAdminPoolBuckets200DataBucketsItem,
  GetAdminPoolBuckets200DataSummary,
  GetAdminPoolSiblingsBuckets200DataBucketsItem,
  GetAdminPoolSiblingsBuckets200DataSummary,
  GetEnglishPoolModels200DataItem,
  GetEnglishPoolQuestions200DataItemsItem,
  GetEnglishPoolQuestionsSort,
  PostAdminPoolRefillBodyOneScope,
  PostAdminPoolSiblingsRefillBodyOneScope,
} from "@/apis/model"

import type { EngLevel, QuizType } from "@/features/quiz/types.ts"

export type PoolQuestion = GetEnglishPoolQuestions200DataItemsItem
export type PoolQuestionsSort = GetEnglishPoolQuestionsSort
export type PoolModelStat = GetEnglishPoolModels200DataItem
export type ManualRefillScope = PostAdminPoolRefillBodyOneScope

export type PoolBucket = GetAdminPoolBuckets200DataBucketsItem
export type PoolBucketSummary = GetAdminPoolBuckets200DataSummary

export type SiblingRefillScope = PostAdminPoolSiblingsRefillBodyOneScope
export type SiblingBucket = GetAdminPoolSiblingsBuckets200DataBucketsItem
export type SiblingBucketSummary = GetAdminPoolSiblingsBuckets200DataSummary

export interface SiblingRefillInput extends PoolBucketFilter {
  models: string[]
  scope: SiblingRefillScope
  sourcesPerBucket?: number
  siblingsPerSource?: number
  /** Chỉ gửi khi admin bỏ tick bucket trong preview. */
  bucketKeys?: string[]
}

/** Chiều lọc bucket. Mảng rỗng = không lọc chiều đó (khớp semantics của API). */
export interface PoolBucketFilter {
  engLevels: EngLevel[]
  topicIds: number[]
  quizTypes: QuizType[]
}

export interface ManualRefillInput extends PoolBucketFilter {
  models: string[]
  scope: ManualRefillScope
  countPerBucket?: number
  /** Chỉ gửi khi admin bỏ tick bucket trong preview; undefined = lấy hết theo filter. */
  bucketKeys?: string[]
}

/** Cột sort được ở table — map 1-1 với các cặp `*_asc`/`*_desc` mà API nhận. */
export type PoolSortableColumn = "id" | "token" | "createdAt"
