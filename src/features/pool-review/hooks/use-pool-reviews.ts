import { keepPreviousData } from "@tanstack/react-query"

import { useGetAdminPoolReviews } from "@/apis/admin-pool-review/admin-pool-review.ts"

import { REVIEWS_PAGE_SIZE } from "../constants.ts"
import type { PoolReviewsParams } from "../types.ts"

export interface PoolReviewsFilterInput {
  status: PoolReviewsParams["status"]
  verdict: PoolReviewsParams["verdict"]
  quizType: string | undefined
  engLevel: string | undefined
  topicId: number | undefined
  poolQuestionRefId: number | undefined
  q: string | undefined
  sort: PoolReviewsParams["sort"]
  page: number
  pageSize: number
}

export function buildPoolReviewsParams({
  status,
  verdict,
  quizType,
  engLevel,
  topicId,
  poolQuestionRefId,
  q,
  sort,
  page,
  pageSize,
}: PoolReviewsFilterInput): PoolReviewsParams {
  return {
    ...(status ? { status } : {}),
    ...(verdict ? { verdict } : {}),
    // quizType/engLevel dùng chung tập giá trị với backend nhưng orval sinh enum
    // riêng cho từng endpoint nên cast cho khớp param type.
    ...(quizType
      ? { quizType: quizType as PoolReviewsParams["quizType"] }
      : {}),
    ...(engLevel
      ? { engLevel: engLevel as PoolReviewsParams["engLevel"] }
      : {}),
    ...(topicId ? { topicId } : {}),
    ...(poolQuestionRefId ? { poolQuestionRefId } : {}),
    ...(q ? { q } : {}),
    ...(sort ? { sort } : {}),
    page,
    pageSize,
  }
}

export function usePoolReviews(params: PoolReviewsParams) {
  const query = useGetAdminPoolReviews(params, {
    query: {
      placeholderData: keepPreviousData,
      // Review chạy fire-and-forget ở backend: poll lại khi trang còn row 'pending'.
      refetchInterval: (q) =>
        q.state.data?.data.items.some((item) => item.status === "pending")
          ? 4000
          : false,
    },
  })

  const data = query.data?.data

  return {
    items: data?.items,
    page: data?.page ?? Number(params.page ?? 1),
    pageSize: data?.pageSize ?? REVIEWS_PAGE_SIZE,
    total: data?.total,
    totalPages: data?.totalPages ?? 1,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}
