import { useQueryClient } from "@tanstack/react-query"

import {
  getGetEnglishTopicsQueryKey,
  usePostEnglishTopics,
} from "@/apis/english-topics/english-topics.ts"
import { toast } from "@/components/ui/toast"
import {
  API_ERROR_CODE,
  getApiErrorMessage,
  isApiErrorCode,
} from "@/lib/api-error.ts"

export function useCreateTopic({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  const mutation = usePostEnglishTopics({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({
          queryKey: getGetEnglishTopicsQueryKey(),
        })
        toast.add({
          type: "success",
          title: "Đã tạo chủ đề",
          description: `Chủ đề "${response.data.name}" đã được thêm vào danh sách.`,
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không tạo được chủ đề",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  const createTopic = (values: { name: string; description: string }) => {
    const description = values.description.trim()
    return mutation.mutateAsync({
      data: {
        name: values.name.trim(),
        ...(description ? { description } : {}),
      },
    })
  }

  return {
    createTopic,
    isPending: mutation.isPending,
    isDuplicateName: isApiErrorCode(mutation.error, API_ERROR_CODE.CONFLICT),
    reset: mutation.reset,
  }
}
