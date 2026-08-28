import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminPoolReviewsQueryKey,
  usePostAdminPoolReviews,
  usePostAdminPoolReviewsByIdApprove,
  usePostAdminPoolReviewsByIdReject,
  useDeleteAdminPoolReviewsById,
} from "@/apis/admin-pool-review/admin-pool-review.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import type {
  ApproveReviewBody,
  EnqueueReviewsBody,
  RejectReviewBody,
} from "../types.ts"

export function useInvalidatePoolReviews() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      queryKey: getGetAdminPoolReviewsQueryKey(),
    })
}

export function useEnqueueReviews({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const invalidate = useInvalidatePoolReviews()

  const mutation = usePostAdminPoolReviews({
    mutation: {
      onSuccess: async (result) => {
        await invalidate()
        const { accepted, skipped } = result.data
        toast.add({
          type: "success",
          title: `Đã gửi ${accepted} câu đi review`,
          description:
            skipped > 0
              ? `${skipped} câu bị bỏ qua vì đang có review chờ duyệt hoặc đang chạy.`
              : undefined,
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không gửi được review",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  return {
    enqueueReviews: (data: EnqueueReviewsBody) =>
      mutation.mutateAsync({ data }),
    isPending: mutation.isPending,
  }
}

export function useApproveReview({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const invalidate = useInvalidatePoolReviews()

  const mutation = usePostAdminPoolReviewsByIdApprove({
    mutation: {
      onSuccess: async () => {
        await invalidate()
        toast.add({
          type: "success",
          title: "Đã duyệt — câu trong pool đã được cập nhật",
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không duyệt được review",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  return {
    approveReview: (id: number, data: ApproveReviewBody = {}) =>
      mutation.mutateAsync({ id, data }),
    isPending: mutation.isPending,
  }
}

export function useRejectReview({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const invalidate = useInvalidatePoolReviews()

  const mutation = usePostAdminPoolReviewsByIdReject({
    mutation: {
      onSuccess: async () => {
        await invalidate()
        toast.add({ type: "success", title: "Đã từ chối review" })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không từ chối được review",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  return {
    rejectReview: (id: number, data: RejectReviewBody = {}) =>
      mutation.mutateAsync({ id, data }),
    isPending: mutation.isPending,
  }
}

export function useDeleteReview({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const invalidate = useInvalidatePoolReviews()

  const mutation = useDeleteAdminPoolReviewsById({
    mutation: {
      onSuccess: async () => {
        await invalidate()
        toast.add({ type: "success", title: "Đã xoá review" })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không xoá được review",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  return {
    deleteReview: (id: number) => mutation.mutateAsync({ id }),
    isPending: mutation.isPending,
  }
}
