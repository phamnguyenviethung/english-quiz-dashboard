import { useMemo } from "react"
import { keepPreviousData } from "@tanstack/react-query"

import { useGetAdminPoolBuckets } from "@/apis/admin-pool/admin-pool.ts"
import type { GetAdminPoolBucketsParams } from "@/apis/model"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"

import { BUCKET_PREVIEW_DEBOUNCE_MS } from "../constants.ts"
import type {
  ManualRefillScope,
  PoolBucket,
  PoolBucketFilter,
  PoolBucketSummary,
} from "../types.ts"

const EMPTY_BUCKETS: PoolBucket[] = []

const EMPTY_SUMMARY: PoolBucketSummary = {
  matchedBuckets: 0,
  plannedBuckets: 0,
  plannedQuestions: 0,
  maxPerBucket: 0,
}

export interface PoolBucketsInput extends PoolBucketFilter {
  scope: ManualRefillScope
  countPerBucket?: number
}

/** API nhận filter dạng CSV; chiều nào rỗng thì bỏ hẳn key khỏi query. */
export function buildPoolBucketsParams(
  input: PoolBucketsInput
): GetAdminPoolBucketsParams {
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
    ...(input.countPerBucket === undefined
      ? {}
      : { countPerBucket: input.countPerBucket }),
  }
}

/**
 * Preview bucket sẽ được refill. Chỉ chạy khi dialog mở (`enabled`) vì scan bucket
 * đụng toàn bộ pool, không đáng chạy nền cho cả trang.
 */
export function usePoolBuckets(input: PoolBucketsInput, enabled: boolean) {
  // Toggle filter bắn liên tục theo từng click nên debounce trước khi thành query key.
  // Debounce chuỗi chứ không debounce object: object dựng lại mỗi render nên identity
  // đổi liên tục, timer sẽ không bao giờ chốt được.
  const paramsKey = JSON.stringify(buildPoolBucketsParams(input))
  const debouncedKey = useDebouncedValue(paramsKey, BUCKET_PREVIEW_DEBOUNCE_MS)
  const params = useMemo(
    () => JSON.parse(debouncedKey) as GetAdminPoolBucketsParams,
    [debouncedKey]
  )

  const query = useGetAdminPoolBuckets(params, {
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
    /** Filter mới nhất chưa kịp vào query — dùng để không hiện số liệu cũ như thể đã chốt. */
    isStale: debouncedKey !== paramsKey,
  }
}
