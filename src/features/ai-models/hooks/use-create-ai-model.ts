import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminModelsQueryKey,
  usePostAdminModels,
} from "@/apis/admin-models/admin-models.ts"
import { toast } from "@/components/ui/toast"
import {
  API_ERROR_CODE,
  getApiErrorMessage,
  isApiErrorCode,
} from "@/lib/api-error.ts"

import type { AiModelFormValues } from "../types.ts"
import { toProviderPayload } from "../utils/provider-preferences.ts"

export function useCreateAiModel({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  const mutation = usePostAdminModels({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({
          queryKey: getGetAdminModelsQueryKey(),
        })
        toast.add({
          type: "success",
          title: "Đã tạo model",
          description: `Model "${response.data.key}" đã sẵn sàng dùng để sinh câu hỏi.`,
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không tạo được model",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  const createAiModel = (values: AiModelFormValues) =>
    mutation.mutateAsync({
      data: {
        key: values.key.trim(),
        modelId: values.modelId.trim(),
        isActive: values.isActive,
        scheduleEnabled: values.scheduleEnabled,
        manualEnabled: values.manualEnabled,
        readingEnabled: values.readingEnabled,
        scheduleProvider: toProviderPayload(values.scheduleProvider),
        manualProvider: toProviderPayload(values.manualProvider),
        readingProvider: toProviderPayload(values.readingProvider),
      },
    })

  return {
    createAiModel,
    isPending: mutation.isPending,
    isConflict: isApiErrorCode(mutation.error, API_ERROR_CODE.CONFLICT),
    reset: mutation.reset,
  }
}
