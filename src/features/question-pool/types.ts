import type {
  GetEnglishPoolCountEngLevel,
  GetEnglishPoolCountQuizType,
  PostEnglishPoolFillBodyOneOptionCount,
} from "@/apis/model"

export type EngLevel = GetEnglishPoolCountEngLevel
export type QuizType = GetEnglishPoolCountQuizType
export type OptionCount = PostEnglishPoolFillBodyOneOptionCount

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
