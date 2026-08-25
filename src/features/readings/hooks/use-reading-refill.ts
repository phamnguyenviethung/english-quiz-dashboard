import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminReadingsQueryKey,
  usePostAdminReadingsRefill,
} from "@/apis/admin-readings/admin-readings.ts"
import type { PostAdminReadingsRefillBodyOneFilter } from "@/apis/model"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import type { ReadingRefillInput } from "../types.ts"

/** Chiều nào rỗng thì bỏ hẳn khỏi payload — API hiểu "vắng mặt" là không lọc chiều đó. */
function buildFilter(
  input: ReadingRefillInput
): PostAdminReadingsRefillBodyOneFilter | undefined {
  const filter: PostAdminReadingsRefillBodyOneFilter = {
    ...(input.cefrLevels.length > 0 ? { cefrLevels: input.cefrLevels } : {}),
    ...(input.topicIds.length > 0 ? { topicIds: input.topicIds } : {}),
    ...(input.types.length > 0 ? { types: input.types } : {}),
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

export function useReadingRefill({
  onStarted,
}: {
  /** Nhận runId để caller tự điều hướng tới màn tiến độ. Có truyền thì toast bỏ nút "Xem tiến độ". */
  onStarted?: (runId: string | null) => void
} = {}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const mutation = usePostAdminReadingsRefill()

  const startRefill = (input: ReadingRefillInput) => {
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
          onStarted?.(runId)

          // Job chạy nền nên kho chưa đổi ngay; invalidate để lần refetch kế tiếp
          // lấy danh sách mới thay vì giữ cache cũ.
          void queryClient.invalidateQueries({
            queryKey: getGetAdminReadingsQueryKey(),
          })

          toast.add({
            type: "success",
            title: "Đã bắt đầu sinh bài đọc",
            description: `${totalBuckets} bucket đang được xử lý nền. Theo dõi tiến độ ở màn Lịch sử cron.`,
            ...(runId && !onStarted
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
            title: "Không chạy được job sinh bài đọc",
            description: getApiErrorMessage(error),
          })
        },
      }
    )
  }

  return { startRefill, isPending: mutation.isPending }
}
