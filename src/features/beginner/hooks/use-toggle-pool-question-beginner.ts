import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminPoolBucketsQueryKey,
  usePatchAdminPoolQuestionsById,
} from "@/apis/admin-pool/admin-pool.ts"
import { getGetEnglishPoolQuestionsQueryKey } from "@/apis/english-question-pool/english-question-pool.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

export function useTogglePoolQuestionBeginner() {
  const queryClient = useQueryClient()
  const mutation = usePatchAdminPoolQuestionsById()

  const setForBeginner = async (id: number, forBeginner: boolean) => {
    try {
      const response = await mutation.mutateAsync({ id, data: { forBeginner } })
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getGetEnglishPoolQuestionsQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: getGetAdminPoolBucketsQueryKey(),
        }),
      ])
      toast.add({
        type: "success",
        title: forBeginner
          ? "Đã chuyển sang người mới"
          : "Đã chuyển về câu thường",
        description: `Câu #${id} đã đổi bucket.`,
      })
      return response.data
    } catch (error) {
      toast.add({
        type: "error",
        title: "Không đổi được đối tượng của câu",
        description: getApiErrorMessage(error),
      })
      return undefined
    }
  }

  return {
    setForBeginner,
    pendingId: mutation.isPending ? Number(mutation.variables.id) : undefined,
  }
}
