import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminReadingsQueryKey,
  useDeleteAdminReadingsById,
  usePatchAdminReadingsById,
} from "@/apis/admin-readings/admin-readings.ts"
import { getGetAdminReadingQuestionsQueryKey } from "@/apis/admin-reading-questions/admin-reading-questions.ts"
import type { PatchAdminReadingsByIdBodyOne } from "@/apis/model"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

/**
 * Sửa `paragraphs` làm backend tắt toàn bộ câu hỏi của bài trong cùng transaction,
 * còn xoá bài thì xoá luôn câu hỏi (cascade). Không invalidate kèm thì tab câu hỏi
 * vẫn hiện dữ liệu cũ.
 */
function useInvalidateReadings() {
  const queryClient = useQueryClient()
  return async () => {
    await queryClient.invalidateQueries({
      queryKey: getGetAdminReadingsQueryKey(),
    })
    await queryClient.invalidateQueries({
      queryKey: getGetAdminReadingQuestionsQueryKey(),
    })
  }
}

export function useUpdateReading({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const invalidate = useInvalidateReadings()

  const mutation = usePatchAdminReadingsById({
    mutation: {
      onSuccess: async () => {
        await invalidate()
        toast.add({ type: "success", title: "Đã cập nhật bài đọc" })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không cập nhật được bài đọc",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  const updateReading = (id: number, data: PatchAdminReadingsByIdBodyOne) =>
    mutation.mutateAsync({ id, data })

  /** Bật/tắt bài — bài đã tắt không được tính vào bucket count nữa. */
  const setActive = (id: number, isActive: boolean) =>
    updateReading(id, { isActive })

  return { updateReading, setActive, isPending: mutation.isPending }
}

export function useDeleteReading({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const invalidate = useInvalidateReadings()

  const mutation = useDeleteAdminReadingsById({
    mutation: {
      onSuccess: async () => {
        await invalidate()
        toast.add({ type: "success", title: "Đã xoá bài đọc" })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không xoá được bài đọc",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  return {
    deleteReading: (id: number) => mutation.mutateAsync({ id }),
    isPending: mutation.isPending,
  }
}
