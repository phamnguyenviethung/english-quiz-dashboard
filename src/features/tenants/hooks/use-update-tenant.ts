import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminTenantsByIdQueryKey,
  getGetAdminTenantsQueryKey,
  usePatchAdminTenantsById,
} from "@/apis/admin-tenants/admin-tenants.ts"
import type { PatchAdminTenantsByIdBodyOne } from "@/apis/model"
import { toast } from "@/components/ui/toast"
import {
  API_ERROR_CODE,
  getApiErrorMessage,
  isApiErrorCode,
} from "@/lib/api-error.ts"

import type { TenantFormValues } from "../types.ts"

export function useUpdateTenant(
  tenantId: number,
  {
    onSuccess,
    successTitle = "Đã cập nhật tenant",
  }: { onSuccess?: () => void; successTitle?: string } = {}
) {
  const queryClient = useQueryClient()

  const mutation = usePatchAdminTenantsById({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getGetAdminTenantsQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: getGetAdminTenantsByIdQueryKey(tenantId),
          }),
        ])
        toast.add({ type: "success", title: successTitle })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không cập nhật được tenant",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  const updateTenant = (data: PatchAdminTenantsByIdBodyOne) =>
    mutation.mutateAsync({ id: tenantId, data })

  const updateTenantFromForm = (values: TenantFormValues) => {
    const description = values.description.trim()
    return updateTenant({
      name: values.name.trim(),
      description: description || null,
      scopes: values.scopes,
      allowAllTopics: values.allowAllTopics,
      allowAllQuizTypes: values.allowAllQuizTypes,
    })
  }

  const setActive = (isActive: boolean) => updateTenant({ isActive })

  return {
    updateTenant,
    updateTenantFromForm,
    setActive,
    isPending: mutation.isPending,
    isDuplicateName: isApiErrorCode(mutation.error, API_ERROR_CODE.CONFLICT),
    reset: mutation.reset,
  }
}
