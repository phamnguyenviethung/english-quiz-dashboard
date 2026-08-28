import { useGetAdminPoolReviewsById } from "@/apis/admin-pool-review/admin-pool-review.ts"

export function usePoolReview(id: number | undefined) {
  const query = useGetAdminPoolReviewsById(id ?? 0, {
    query: { enabled: id !== undefined },
  })

  return {
    review: query.data?.data,
    isPending: query.isPending && id !== undefined,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
