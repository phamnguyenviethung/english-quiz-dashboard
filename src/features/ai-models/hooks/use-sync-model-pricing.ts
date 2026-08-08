import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminModelsQueryKey,
  usePostAdminModelsByIdSync,
  usePostAdminModelsSyncAll,
} from "@/apis/admin-models/admin-models.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

/** Nạp lại giá từ OpenRouter catalog cho một model. */
export function useSyncModelPricing() {
  const queryClient = useQueryClient()

  const mutation = usePostAdminModelsByIdSync({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({
          queryKey: getGetAdminModelsQueryKey(),
        })
        toast.add({
          type: "success",
          title: "Đã đồng bộ giá",
          description: `Model "${response.data.key}" đã cập nhật giá mới nhất.`,
        })
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không đồng bộ được giá",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  return {
    syncModelPricing: (id: number) => mutation.mutateAsync({ id }),
    isPending: mutation.isPending,
    pendingId: mutation.isPending ? mutation.variables.id : undefined,
  }
}

/** Nạp lại giá cho toàn bộ model đang có trong DB. */
export function useSyncAllModelsPricing() {
  const queryClient = useQueryClient()

  const mutation = usePostAdminModelsSyncAll({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({
          queryKey: getGetAdminModelsQueryKey(),
        })
        const { synced, notFound } = response.data
        toast.add({
          type: "success",
          title: `Đã đồng bộ giá ${synced} model`,
          description:
            notFound.length > 0
              ? `Không tìm thấy trên catalog: ${notFound.join(", ")}`
              : undefined,
        })
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không đồng bộ được giá",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  return {
    syncAllModelsPricing: () => mutation.mutateAsync(),
    isPending: mutation.isPending,
  }
}
