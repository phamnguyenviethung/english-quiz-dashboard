import { useQueryClient } from "@tanstack/react-query"

import {
  getGetEnglishTopicsQueryKey,
  usePatchEnglishTopicsById,
} from "@/apis/english-topics/english-topics.ts"
import type { PatchEnglishTopicsByIdBodyOne } from "@/apis/model"
import { getGetAdminPoolBucketsQueryKey } from "@/apis/admin-pool/admin-pool.ts"
import { getGetAdminReadingsBucketsQueryKey } from "@/apis/admin-readings/admin-readings.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

export function useUpdateTopic() {
  const queryClient = useQueryClient()
  const mutation = usePatchEnglishTopicsById()

  const updateTopic = async (
    id: number,
    patch: PatchEnglishTopicsByIdBodyOne,
    successMessage?: { title: string; description?: string }
  ) => {
    try {
      const response = await mutation.mutateAsync({ id, data: patch })
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getGetEnglishTopicsQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: getGetAdminPoolBucketsQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: getGetAdminReadingsBucketsQueryKey(),
        }),
      ])
      toast.add({
        type: "success",
        title: successMessage?.title ?? "Đã cập nhật chủ đề",
        description: successMessage?.description,
      })
      return response.data
    } catch (error) {
      toast.add({
        type: "error",
        title: "Không cập nhật được chủ đề",
        description: getApiErrorMessage(error),
      })
      return undefined
    }
  }

  const setForBeginner = (id: number, name: string, forBeginner: boolean) =>
    updateTopic(
      id,
      { forBeginner },
      {
        title: forBeginner ? "Đã bật cho người mới" : "Đã tắt cho người mới",
        description: forBeginner
          ? `"${name}" sẽ có câu hỏi và bài đọc A1–B1 dành cho người mới.`
          : `"${name}" ngừng sinh nội dung beginner mới. Nội dung đã có vẫn được giữ.`,
      }
    )

  return {
    updateTopic,
    setForBeginner,
    isPending: mutation.isPending,
    pendingTopicId: mutation.isPending
      ? Number(mutation.variables.id)
      : undefined,
  }
}
