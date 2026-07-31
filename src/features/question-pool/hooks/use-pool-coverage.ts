import { useQueries } from "@tanstack/react-query"

import { getGetEnglishPoolCountQueryOptions } from "@/apis/english-question-pool/english-question-pool.ts"
import { isAuthError } from "@/lib/api-error.ts"

import { PENDING_FILL_POLL_MS, QUIZ_TYPES } from "../constants.ts"
import type { EngLevel, PoolCoverageCell, QuizType } from "../types.ts"

export function usePoolCoverage({
  engLevel,
  topicId,
  pending,
}: {
  engLevel: EngLevel
  topicId: number | undefined
  pending: ReadonlySet<QuizType>
}) {
  const cells = useQueries({
    queries: QUIZ_TYPES.map((quizType) => ({
      ...getGetEnglishPoolCountQueryOptions({
        engLevel,
        quizType,
        ...(topicId === undefined ? {} : { topicId }),
      }),
      refetchInterval: pending.has(quizType)
        ? PENDING_FILL_POLL_MS
        : (false as const),
    })),
    combine: (results): PoolCoverageCell[] =>
      results.map((result, index) => ({
        quizType: QUIZ_TYPES[index],
        count: result.data?.data.count,
        isPending: result.isPending,
        isError: result.isError,
        error: result.error,
        isFetching: result.isFetching,
        refetch: () => void result.refetch(),
      })),
  })

  const total = cells.reduce<number | undefined>((sum, cell) => {
    if (sum === undefined || cell.count === undefined) return undefined
    return sum + cell.count
  }, 0)

  const authError = cells.every(
    (cell) => cell.isError && isAuthError(cell.error)
  )
    ? cells[0].error
    : undefined

  return { cells, total, authError }
}
