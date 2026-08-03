import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminTenantsQueryKey,
  usePostAdminTenants,
} from "@/apis/admin-tenants/admin-tenants.ts"
import { toast } from "@/components/ui/toast"
import {
  API_ERROR_CODE,
  getApiErrorMessage,
  isApiErrorCode,
} from "@/lib/api-error.ts"

import type { TenantFormValues } from "../types.ts"

export function useCreateTenant({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  const mutation = usePostAdminTenants({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({
          queryKey: getGetAdminTenantsQueryKey(),
        })
        toast.add({
          type: "success",
          title: "Đã tạo tenant",
          description: `Tenant "${response.data.name}" đã sẵn sàng, cấp API key để bắt đầu dùng.`,
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không tạo được tenant",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  const createTenant = (values: TenantFormValues) => {
    const description = values.description.trim()
    return mutation.mutateAsync({
      data: {
        name: values.name.trim(),
        description: description || null,
        scopes: values.scopes,
        allowAllTopics: values.allowAllTopics,
        allowAllQuizTypes: values.allowAllQuizTypes,
      },
    })
  }

  return {
    createTenant,
    isPending: mutation.isPending,
    isDuplicateName: isApiErrorCode(mutation.error, API_ERROR_CODE.CONFLICT),
    reset: mutation.reset,
  }
}
