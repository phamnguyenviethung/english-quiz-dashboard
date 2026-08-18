import { useMemo } from "react"
import { keepPreviousData } from "@tanstack/react-query"

import { useGetAdminReadingQuestionsBuckets } from "@/apis/admin-reading-questions/admin-reading-questions.ts"
import type { GetAdminReadingQuestionsBucketsParams } from "@/apis/model"
import { BUCKET_PREVIEW_DEBOUNCE_MS } from "@/features/refill/constants.ts"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"

import type {
  ReadingQuestionBucket,
  ReadingQuestionBucketFilter,
  ReadingQuestionBucketSummary,
  ReadingQuestionRefillScope,
} from "../types.ts"

const EMPTY_BUCKETS: ReadingQuestionBucket[] = []

const EMPTY_SUMMARY: ReadingQuestionBucketSummary = {
  matchedPassages: 0,
  plannedPassages: 0,
  plannedQuestions: 0,
  questionsPerPassage: 0,
}

export interface ReadingQuestionBucketsInput extends ReadingQuestionBucketFilter {
  scope: ReadingQuestionRefillScope
}

/** API nhận filter dạng CSV; chiều nào rỗng thì bỏ hẳn key khỏi query. */
export function buildReadingQuestionBucketsParams(
  input: ReadingQuestionBucketsInput
): GetAdminReadingQuestionsBucketsParams {
  return {
    scope: input.scope,
    ...(input.cefrLevels.length > 0
      ? { cefrLevels: input.cefrLevels.join(",") }
      : {}),
    ...(input.topicIds.length > 0
      ? { topicIds: input.topicIds.join(",") }
      : {}),
    ...(input.passageIds.length > 0
      ? { passageIds: input.passageIds.join(",") }
      : {}),
  }
}

/**
 * Preview bài sẽ được sinh câu hỏi. Debounce chuỗi params chứ không debounce object:
 * object dựng lại mỗi render nên identity đổi liên tục, timer sẽ không bao giờ chốt.
 */
export function useReadingQuestionBuckets(
  input: ReadingQuestionBucketsInput,
  enabled: boolean
) {
  const paramsKey = JSON.stringify(buildReadingQuestionBucketsParams(input))
  const debouncedKey = useDebouncedValue(paramsKey, BUCKET_PREVIEW_DEBOUNCE_MS)
  const params = useMemo(
    () => JSON.parse(debouncedKey) as GetAdminReadingQuestionsBucketsParams,
    [debouncedKey]
  )

  const query = useGetAdminReadingQuestionsBuckets(params, {
    query: { enabled, placeholderData: keepPreviousData },
  })

  return {
    buckets: query.data?.data.buckets ?? EMPTY_BUCKETS,
    summary: query.data?.data.summary ?? EMPTY_SUMMARY,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    /** Filter mới nhất chưa kịp vào query — dùng để không hiện số liệu cũ như đã chốt. */
    isStale: debouncedKey !== paramsKey,
  }
}
