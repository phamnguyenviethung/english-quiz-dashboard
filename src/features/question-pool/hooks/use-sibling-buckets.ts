import { useMemo } from "react"
import { keepPreviousData } from "@tanstack/react-query"

import { useGetAdminPoolSiblingsBuckets } from "@/apis/admin-pool-sibling/admin-pool-sibling.ts"
import type { GetAdminPoolSiblingsBucketsParams } from "@/apis/model"
import { BUCKET_PREVIEW_DEBOUNCE_MS } from "@/features/refill/constants.ts"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"

import type {
  PoolBucketFilter,
  SiblingBucket,
  SiblingBucketSummary,
  SiblingRefillScope,
} from "../types.ts"

const EMPTY_BUCKETS: SiblingBucket[] = []

const EMPTY_SUMMARY: SiblingBucketSummary = {
  matchedBuckets: 0,
  plannedBuckets: 0,
  plannedSiblings: 0,
  maxPerBucket: 0,
}

export interface SiblingBucketsInput extends PoolBucketFilter {
  scope: SiblingRefillScope
  sourcesPerBucket?: number
  siblingsPerSource?: number
}

/** API nhận filter dạng CSV; chiều nào rỗng thì bỏ hẳn key khỏi query. */
export function buildSiblingBucketsParams(
  input: SiblingBucketsInput
): GetAdminPoolSiblingsBucketsParams {
  return {
    scope: input.scope,
    ...(input.engLevels.length > 0
      ? { engLevels: input.engLevels.join(",") }
      : {}),
    ...(input.topicIds.length > 0
      ? { topicIds: input.topicIds.join(",") }
      : {}),
    ...(input.quizTypes.length > 0
      ? { quizTypes: input.quizTypes.join(",") }
      : {}),
    ...(input.audience ? { audience: input.audience } : {}),
    ...(input.sourcesPerBucket === undefined
      ? {}
      : { sourcesPerBucket: input.sourcesPerBucket }),
    ...(input.siblingsPerSource === undefined
      ? {}
      : { siblingsPerSource: input.siblingsPerSource }),
  }
}

/** Preview bucket sẽ sinh câu tương tự. Chỉ chạy khi `enabled` (scan đụng toàn bộ pool). */
export function useSiblingBuckets(
  input: SiblingBucketsInput,
  enabled: boolean
) {
  const paramsKey = JSON.stringify(buildSiblingBucketsParams(input))
  const debouncedKey = useDebouncedValue(paramsKey, BUCKET_PREVIEW_DEBOUNCE_MS)
  const params = useMemo(
    () => JSON.parse(debouncedKey) as GetAdminPoolSiblingsBucketsParams,
    [debouncedKey]
  )

  const query = useGetAdminPoolSiblingsBuckets(params, {
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
    isStale: debouncedKey !== paramsKey,
  }
}
