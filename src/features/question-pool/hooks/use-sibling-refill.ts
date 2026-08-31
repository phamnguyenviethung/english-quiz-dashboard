import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"

import { usePostAdminPoolSiblingsRefill } from "@/apis/admin-pool-sibling/admin-pool-sibling.ts"
import {
  getGetEnglishPoolCountQueryKey,
  getGetEnglishPoolQuestionsQueryKey,
} from "@/apis/english-question-pool/english-question-pool.ts"
import type { PostAdminPoolSiblingsRefillBodyOneFilter } from "@/apis/model"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import type { SiblingRefillInput } from "../types.ts"

function buildFilter(
  input: SiblingRefillInput
): PostAdminPoolSiblingsRefillBodyOneFilter | undefined {
  const filter: PostAdminPoolSiblingsRefillBodyOneFilter = {
    ...(input.engLevels.length > 0 ? { engLevels: input.engLevels } : {}),
    ...(input.topicIds.length > 0 ? { topicIds: input.topicIds } : {}),
    ...(input.quizTypes.length > 0 ? { quizTypes: input.quizTypes } : {}),
  }
  return Object.keys(filter).length > 0 ? filter : undefined
}

export function useSiblingRefill({
  onStarted,
}: { onStarted?: (runId: string | null) => void } = {}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const mutation = usePostAdminPoolSiblingsRefill()

  const startRefill = (input: SiblingRefillInput) => {
    const filter = buildFilter(input)

    mutation.mutate(
      {
        data: {
          scope: input.scope,
          ...(input.models.length > 0 ? { models: input.models } : {}),
          ...(input.sourcesPerBucket === undefined
            ? {}
            : { sourcesPerBucket: input.sourcesPerBucket }),
          ...(input.siblingsPerSource === undefined
            ? {}
            : { siblingsPerSource: input.siblingsPerSource }),
          ...(filter ? { filter } : {}),
          ...(input.bucketKeys ? { bucketKeys: input.bucketKeys } : {}),
        },
      },
      {
        onSuccess: (response) => {
          const { runId, totalBuckets } = response.data
          onStarted?.(runId)
          void queryClient.invalidateQueries({
            queryKey: getGetEnglishPoolCountQueryKey(),
          })
          void queryClient.invalidateQueries({
            queryKey: getGetEnglishPoolQuestionsQueryKey(),
          })
          toast.add({
            type: "success",
            title: "Đã bắt đầu sinh câu tương tự",
            description: `${totalBuckets} bucket đang được xử lý nền. Theo dõi ở màn Lịch sử cron.`,
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
            title: "Không chạy được sinh câu tương tự",
            description: getApiErrorMessage(error),
          })
        },
      }
    )
  }

  return { startRefill, isPending: mutation.isPending }
}
