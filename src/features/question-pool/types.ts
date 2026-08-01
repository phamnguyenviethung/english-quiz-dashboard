import type {
  GetEnglishPoolQuestions200DataItemsItem,
  GetEnglishPoolQuestionsSort,
} from "@/apis/model"
import type { QuizType } from "@/features/quiz/types.ts"

export type PoolQuestion = GetEnglishPoolQuestions200DataItemsItem
export type PoolQuestionsSort = GetEnglishPoolQuestionsSort

export interface PoolCoverageCell {
  quizType: QuizType
  count: number | undefined
  isPending: boolean
  isError: boolean
  error: unknown
  isFetching: boolean
  refetch: () => void
}

export type PoolStatus = "empty" | "low" | "healthy"
