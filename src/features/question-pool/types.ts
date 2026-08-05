import type {
  GetEnglishPoolModels200DataItem,
  GetEnglishPoolQuestions200DataItemsItem,
  GetEnglishPoolQuestionsSort,
  PostAdminPoolRefillBodyOneScope,
} from "@/apis/model"

export type PoolQuestion = GetEnglishPoolQuestions200DataItemsItem
export type PoolQuestionsSort = GetEnglishPoolQuestionsSort
export type PoolModelStat = GetEnglishPoolModels200DataItem
export type ManualRefillScope = PostAdminPoolRefillBodyOneScope

/** Cột sort được ở table — map 1-1 với các cặp `*_asc`/`*_desc` mà API nhận. */
export type PoolSortableColumn = "id" | "token" | "createdAt"
