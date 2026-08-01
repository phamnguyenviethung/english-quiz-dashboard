import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"

import { usePostAdminPoolRefill } from "@/apis/admin-pool/admin-pool.ts"
import { getGetEnglishPoolCountQueryKey } from "@/apis/english-question-pool/english-question-pool.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import type { ManualRefillScope } from "../types.ts"

export function useManualRefill({
  onStarted,
}: { onStarted?: () => void } = {}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const mutation = usePostAdminPoolRefill()

  const startRefill = ({
    scope,
    countPerBucket,
  }: {
    scope: ManualRefillScope
    countPerBucket?: number
  }) => {
    mutation.mutate(
      {
        data: {
          scope,
          ...(countPerBucket === undefined ? {} : { countPerBucket }),
        },
      },
      {
        onSuccess: (response) => {
          const { runId, totalBuckets } = response.data
          onStarted?.()

          // Job chạy nền nên count chưa đổi ngay; invalidate để lần refetch kế
          // tiếp lấy số mới thay vì giữ cache cũ.
          void queryClient.invalidateQueries({
            queryKey: getGetEnglishPoolCountQueryKey(),
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
