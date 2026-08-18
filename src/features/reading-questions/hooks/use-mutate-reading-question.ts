import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminReadingQuestionsQueryKey,
  useDeleteAdminReadingQuestionsById,
  usePatchAdminReadingQuestionsById,
} from "@/apis/admin-reading-questions/admin-reading-questions.ts"
import type { PatchAdminReadingQuestionsByIdBodyOne } from "@/apis/model"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

export function useInvalidateReadingQuestions() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      queryKey: getGetAdminReadingQuestionsQueryKey(),
    })
}

export function useUpdateReadingQuestion({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const invalidate = useInvalidateReadingQuestions()

  const mutation = usePatchAdminReadingQuestionsById({
    mutation: {
      onSuccess: async () => {
        await invalidate()
        toast.add({ type: "success", title: "Đã cập nhật câu hỏi" })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không cập nhật được câu hỏi",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  const updateQuestion = (
    id: number,
    data: PatchAdminReadingQuestionsByIdBodyOne
  ) => mutation.mutateAsync({ id, data })

  /** Tắt câu làm bài bị coi là thiếu và sẽ được sinh bù ở lần chạy sau. */
  const setActive = (id: number, isActive: boolean) =>
    updateQuestion(id, { isActive })

  return { updateQuestion, setActive, isPending: mutation.isPending }
}

export function useDeleteReadingQuestion({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const invalidate = useInvalidateReadingQuestions()

  const mutation = useDeleteAdminReadingQuestionsById({
    mutation: {
      onSuccess: async () => {
        await invalidate()
        toast.add({ type: "success", title: "Đã xoá câu hỏi" })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không xoá được câu hỏi",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  return {
    deleteQuestion: (id: number) => mutation.mutateAsync({ id }),
    isPending: mutation.isPending,
  }
}
