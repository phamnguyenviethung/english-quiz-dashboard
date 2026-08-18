import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminReadingQuestionsQueryKey,
  usePostAdminReadingQuestionsRefill,
} from "@/apis/admin-reading-questions/admin-reading-questions.ts"
import type { PostAdminReadingQuestionsRefillBodyOneFilter } from "@/apis/model"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import type { ReadingQuestionRefillInput } from "../types.ts"

/** Chiều nào rỗng thì bỏ hẳn khỏi payload — API hiểu "vắng mặt" là không lọc chiều đó. */
function buildFilter(
  input: ReadingQuestionRefillInput
): PostAdminReadingQuestionsRefillBodyOneFilter | undefined {
  const filter: PostAdminReadingQuestionsRefillBodyOneFilter = {
    ...(input.cefrLevels.length > 0 ? { cefrLevels: input.cefrLevels } : {}),
    ...(input.topicIds.length > 0 ? { topicIds: input.topicIds } : {}),
    ...(input.passageIds.length > 0 ? { passageIds: input.passageIds } : {}),
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

export function useReadingQuestionRefill({
  onStarted,
}: {
  onStarted?: (runId: string | null) => void
} = {}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const mutation = usePostAdminReadingQuestionsRefill()

  const startRefill = (input: ReadingQuestionRefillInput) => {
    const filter = buildFilter(input)

    mutation.mutate(
      {
        data: {
          scope: input.scope,
          ...(input.models.length > 0 ? { models: input.models } : {}),
          ...(filter ? { filter } : {}),
          ...(input.bucketKeys ? { bucketKeys: input.bucketKeys } : {}),
        },
      },
      {
        onSuccess: (response) => {
          const { runId, totalBuckets } = response.data
          onStarted?.(runId)

          void queryClient.invalidateQueries({
            queryKey: getGetAdminReadingQuestionsQueryKey(),
          })

          toast.add({
            type: "success",
            title: "Đã bắt đầu sinh câu hỏi",
            description: `${totalBuckets} bài đang được xử lý nền. Theo dõi tiến độ ở màn Lịch sử cron.`,
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
            title: "Không chạy được job sinh câu hỏi",
            description: getApiErrorMessage(error),
          })
        },
      }
    )
  }

  return { startRefill, isPending: mutation.isPending }
}
