import { useQueryClient } from "@tanstack/react-query"

import {
  getGetEnglishPoolCountQueryKey,
  usePostEnglishPoolFill,
} from "@/apis/english-question-pool/english-question-pool.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import { QUIZ_TYPE_META } from "@/features/quiz/constants.ts"
import type { EngLevel, OptionCount, QuizType } from "@/features/quiz/types.ts"

export function useFillPool({
  engLevel,
  topicId,
  optionCount,
  onEnqueued,
}: {
  engLevel: EngLevel
  topicId: number | undefined
  optionCount: OptionCount
  onEnqueued: (quizType: QuizType) => void
}) {
  const queryClient = useQueryClient()
  const mutation = usePostEnglishPoolFill()

  const fillBucket = (quizType: QuizType) => {
    const bucketLabel = `${engLevel} · ${QUIZ_TYPE_META[quizType].label}`

    mutation.mutate(
      {
        data: {
          engLevel,
          quizType,
          optionCount,
          topicId: topicId ?? null,
        },
      },
      {
        onSuccess: (response) => {
          void queryClient.invalidateQueries({
            queryKey: getGetEnglishPoolCountQueryKey({
              engLevel,
              quizType,
              ...(topicId === undefined ? {} : { topicId }),
            }),
          })

          if (response.data.enqueued) {
            onEnqueued(quizType)
            toast.add({
              type: "success",
              title: "Đã đưa vào hàng đợi",
              description: `Job tạo câu hỏi cho ${bucketLabel} đã chạy. Số lượng sẽ cập nhật khi job xong.`,
            })
          } else {
            toast.add({
              type: "info",
              title: "Không cần tạo thêm",
              description: `Bucket ${bucketLabel} đã đủ câu hỏi theo ngưỡng cấu hình.`,
            })
          }
        },
        onError: (error) => {
          toast.add({
            type: "error",
            title: "Không tạo được job",
            description: getApiErrorMessage(error),
          })
        },
      }
    )
  }

  return {
    fillBucket,
    pendingQuizType: mutation.isPending
      ? mutation.variables.data.quizType
      : undefined,
  }
}
