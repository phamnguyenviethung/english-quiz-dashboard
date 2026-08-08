import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminModelsQueryKey,
  usePatchAdminModelsById,
} from "@/apis/admin-models/admin-models.ts"
import type { PatchAdminModelsByIdBodyOne } from "@/apis/model"
import { toast } from "@/components/ui/toast"
import {
  API_ERROR_CODE,
  getApiErrorMessage,
  isApiErrorCode,
} from "@/lib/api-error.ts"

import type { AiModelFormValues } from "../types.ts"
import { toProviderPayload } from "../utils/provider-preferences.ts"

export function useUpdateAiModel(
  modelId: number,
  {
    onSuccess,
    successTitle = "Đã cập nhật model",
  }: { onSuccess?: () => void; successTitle?: string } = {}
) {
  const queryClient = useQueryClient()

  const mutation = usePatchAdminModelsById({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetAdminModelsQueryKey(),
        })
        toast.add({ type: "success", title: successTitle })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không cập nhật được model",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  const updateAiModel = (data: PatchAdminModelsByIdBodyOne) =>
    mutation.mutateAsync({ id: modelId, data })

  const updateAiModelFromForm = (values: AiModelFormValues) =>
    updateAiModel({
      key: values.key.trim(),
      modelId: values.modelId.trim(),
      isActive: values.isActive,
      scheduleEnabled: values.scheduleEnabled,
      manualEnabled: values.manualEnabled,
      scheduleProvider: toProviderPayload(values.scheduleProvider),
      manualProvider: toProviderPayload(values.manualProvider),
    })

  const setActive = (isActive: boolean) => updateAiModel({ isActive })

  return {
    updateAiModel,
    updateAiModelFromForm,
    setActive,
    isPending: mutation.isPending,
    isConflict: isApiErrorCode(mutation.error, API_ERROR_CODE.CONFLICT),
    reset: mutation.reset,
  }
}
