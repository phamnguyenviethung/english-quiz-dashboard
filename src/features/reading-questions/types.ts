import type {
  GetAdminReadingQuestions200DataItemsItem,
  GetAdminReadingQuestionsBuckets200DataBucketsItem,
  GetAdminReadingQuestionsBuckets200DataSummary,
  GetAdminReadingQuestionsModels200DataItem,
  GetAdminReadingQuestionsSort,
  PostAdminReadingQuestionsGenerate200DataQuestionsItem,
  PostAdminReadingQuestionsGenerate200DataUsage,
  PostAdminReadingQuestionsRefillBodyOneScope,
} from "@/apis/model"

import type { EngLevel } from "@/features/quiz/types.ts"

export type ReadingQuestion = GetAdminReadingQuestions200DataItemsItem
export type ReadingQuestionsSort = GetAdminReadingQuestionsSort
export type ReadingQuestionModelStat = GetAdminReadingQuestionsModels200DataItem
export type ReadingQuestionRefillScope =
  PostAdminReadingQuestionsRefillBodyOneScope

export type GeneratedReadingQuestion =
  PostAdminReadingQuestionsGenerate200DataQuestionsItem
export type GeneratedReadingQuestionUsage =
  PostAdminReadingQuestionsGenerate200DataUsage

export type ReadingQuestionBucket =
  GetAdminReadingQuestionsBuckets200DataBucketsItem
export type ReadingQuestionBucketSummary =
  GetAdminReadingQuestionsBuckets200DataSummary

/** Chiều lọc bucket. Mảng rỗng = không lọc chiều đó (khớp semantics của API). */
export interface ReadingQuestionBucketFilter {
  cefrLevels: EngLevel[]
  topicIds: number[]
  passageIds: number[]
}

export interface ReadingQuestionRefillInput extends ReadingQuestionBucketFilter {
  models: string[]
  scope: ReadingQuestionRefillScope
  /** Chỉ gửi khi admin bỏ tick bài trong preview; undefined = lấy hết theo filter. */
  bucketKeys?: string[]
}

/** Cột sort được ở table — map 1-1 với các cặp `*_asc`/`*_desc` mà API nhận. */
export type ReadingQuestionSortableColumn = "id" | "passage" | "createdAt"

/** Câu hỏi đã lưu và câu sinh thử dùng chung renderer nên gom về shape tối thiểu. */
export interface ReadingQuestionView {
  quizType: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}
