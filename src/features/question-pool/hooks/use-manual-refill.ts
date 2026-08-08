import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"

import { usePostAdminPoolRefill } from "@/apis/admin-pool/admin-pool.ts"
import {
  getGetEnglishPoolCountQueryKey,
  getGetEnglishPoolQuestionsQueryKey,
} from "@/apis/english-question-pool/english-question-pool.ts"
import type { PostAdminPoolRefillBodyOneFilter } from "@/apis/model"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import type { ManualRefillInput } from "../types.ts"

/** Chiều nào rỗng thì bỏ hẳn khỏi payload — API hiểu "vắng mặt" là không lọc chiều đó. */
function buildFilter(
  input: ManualRefillInput
): PostAdminPoolRefillBodyOneFilter | undefined {
  const filter: PostAdminPoolRefillBodyOneFilter = {
    ...(input.engLevels.length > 0 ? { engLevels: input.engLevels } : {}),
    ...(input.topicIds.length > 0 ? { topicIds: input.topicIds } : {}),
    ...(input.quizTypes.length > 0 ? { quizTypes: input.quizTypes } : {}),
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

export function useManualRefill({
  onStarted,
}: { onStarted?: () => void } = {}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const mutation = usePostAdminPoolRefill()

  const startRefill = (input: ManualRefillInput) => {
    const filter = buildFilter(input)

    mutation.mutate(
      {
        data: {
          scope: input.scope,
          ...(input.models.length > 0 ? { models: input.models } : {}),
          ...(input.countPerBucket === undefined
            ? {}
            : { countPerBucket: input.countPerBucket }),
          ...(filter ? { filter } : {}),
          ...(input.bucketKeys ? { bucketKeys: input.bucketKeys } : {}),
        },
      },
      {
        onSuccess: (response) => {
          const { runId, totalBuckets } = response.data
          onStarted?.()

          // Job chạy nền nên count chưa đổi ngay; invalidate để lần refetch kế
          // tiếp lấy số mới thay vì giữ cache cũ. Bảng câu hỏi ngay trên trang này
          // cũng stale theo nên invalidate luôn.
          void queryClient.invalidateQueries({
            queryKey: getGetEnglishPoolCountQueryKey(),
          })
          void queryClient.invalidateQueries({
            queryKey: getGetEnglishPoolQuestionsQueryKey(),
          })

          toast.add({
            type: "success",
            title: "Đã bắt đầu refill",
            description: `${totalBuckets} bucket đang được xử lý nền. Theo dõi tiến độ ở màn Lịch sử cron.`,
            ...(runId
              ? {
                  actionProps: {
                    children: "Xem tiến độ",
                    onClick: () =>
                      void navigate({ to: "/cron-runs", search: { runId } }),
                  },
                }
              : {}),
          })
        },
        onError: (error) => {
          toast.add({
            type: "error",
            title: "Không chạy được refill",
            description: getApiErrorMessage(error),
          })
        },
      }
    )
  }

  return { startRefill, isPending: mutation.isPending }
}
