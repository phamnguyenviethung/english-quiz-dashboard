import { useMemo } from "react"
import { keepPreviousData } from "@tanstack/react-query"

import { useGetAdminReadingsBuckets } from "@/apis/admin-readings/admin-readings.ts"
import type { GetAdminReadingsBucketsParams } from "@/apis/model"
import { BUCKET_PREVIEW_DEBOUNCE_MS } from "@/features/refill/constants.ts"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"

import type {
  ReadingBucket,
  ReadingBucketFilter,
  ReadingBucketSummary,
  ReadingRefillScope,
} from "../types.ts"

const EMPTY_BUCKETS: ReadingBucket[] = []

const EMPTY_SUMMARY: ReadingBucketSummary = {
  matchedBuckets: 0,
  plannedBuckets: 0,
  plannedPassages: 0,
  maxPerBucket: 0,
}

export interface ReadingBucketsInput extends ReadingBucketFilter {
  scope: ReadingRefillScope
  countPerBucket?: number
}

/** API nhận filter dạng CSV; chiều nào rỗng thì bỏ hẳn key khỏi query. */
export function buildReadingBucketsParams(
  input: ReadingBucketsInput
): GetAdminReadingsBucketsParams {
  return {
    scope: input.scope,
    ...(input.cefrLevels.length > 0
      ? { cefrLevels: input.cefrLevels.join(",") }
      : {}),
    ...(input.topicIds.length > 0
      ? { topicIds: input.topicIds.join(",") }
      : {}),
    ...(input.countPerBucket === undefined
      ? {}
      : { countPerBucket: input.countPerBucket }),
  }
}

/**
 * Preview bucket sẽ được sinh. Debounce chuỗi params chứ không debounce object:
 * object dựng lại mỗi render nên identity đổi liên tục, timer sẽ không bao giờ chốt.
 */
export function useReadingBuckets(
  input: ReadingBucketsInput,
  enabled: boolean
) {
  const paramsKey = JSON.stringify(buildReadingBucketsParams(input))
  const debouncedKey = useDebouncedValue(paramsKey, BUCKET_PREVIEW_DEBOUNCE_MS)
  const params = useMemo(
    () => JSON.parse(debouncedKey) as GetAdminReadingsBucketsParams,
    [debouncedKey]
  )

  const query = useGetAdminReadingsBuckets(params, {
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
