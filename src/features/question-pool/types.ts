import type { QuizType } from "@/features/quiz/types.ts"

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
