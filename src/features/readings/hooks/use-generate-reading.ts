import { usePostAdminReadingsGenerate } from "@/apis/admin-readings/admin-readings.ts"
import type { PostAdminReadingsGenerateBodyOne } from "@/apis/model"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

export interface GenerateReadingInput {
  topicName: string
  cefrLevel: PostAdminReadingsGenerateBodyOne["cefrLevel"]
  type: PostAdminReadingsGenerateBodyOne["type"]
  model?: string
}

/**
 * Sinh thử 1 bài để xem prompt/model cho ra gì. Endpoint này KHÔNG lưu — bài sinh ra
 * không xuất hiện trong kho, muốn lưu thì dùng màn "Sinh hàng loạt".
 */
export function useGenerateReading() {
  const mutation = usePostAdminReadingsGenerate({
    mutation: {
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không tạo được bài đọc",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  const generate = (input: GenerateReadingInput) =>
    mutation.mutateAsync({
      data: {
        topicName: input.topicName.trim(),
        cefrLevel: input.cefrLevel,
        type: input.type,
        ...(input.model ? { model: input.model } : {}),
      },
    })

  const data = mutation.data?.data

  return {
    generate,
    passage: data?.passage,
    usage: data?.usage,
    isPending: mutation.isPending,
    isError: mutation.isError,
    reset: mutation.reset,
  }
}
