import { useMemo } from "react"

import {
  getGetEnglishPoolPopQueryOptions,
  useGetEnglishPoolPop,
} from "@/apis/english-question-pool/english-question-pool.ts"
import { getHttpStatus } from "@/lib/api-error.ts"

import type { EngLevel } from "../types.ts"
import { parseQuestionData } from "../utils/question-data.ts"

export function usePoolPreview({
  engLevel,
  topicId,
  enabled,
}: {
  engLevel: EngLevel
  topicId: number | undefined
  enabled: boolean
}) {
  const params = { engLevel, ...(topicId === undefined ? {} : { topicId }) }
  const query = useGetEnglishPoolPop(params, {
    query: {
      ...getGetEnglishPoolPopQueryOptions(params),
      enabled,
      gcTime: 0,
      staleTime: 0,
    },
  })

  const question = query.data?.data
  const parsed = useMemo(
    () => (question ? parseQuestionData(question.questionData) : undefined),
    [question]
  )

  return {
    question,
    parsed,
    isPending: query.isPending && query.fetchStatus !== "idle",
    isEmpty: query.isError && getHttpStatus(query.error) === 404,
    isError: query.isError && getHttpStatus(query.error) !== 404,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}
