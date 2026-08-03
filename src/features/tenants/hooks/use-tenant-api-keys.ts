import { useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminTenantsByIdKeysQueryKey,
  useDeleteAdminTenantsByIdKeysByApiKeyId,
  useGetAdminTenantsByIdKeys,
  usePostAdminTenantsByIdKeys,
} from "@/apis/admin-api-keys/admin-api-keys.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import type { IssuedApiKey, TenantApiKey } from "../types.ts"

export function useTenantApiKeys(tenantId: number) {
  const query = useGetAdminTenantsByIdKeys(tenantId)

  const apiKeys = useMemo<TenantApiKey[]>(
    () => query.data?.data ?? [],
    [query.data]
  )

  return {
    apiKeys,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}

export function useIssueApiKey(
  tenantId: number,
  { onSuccess }: { onSuccess?: (issued: IssuedApiKey) => void } = {}
) {
  const queryClient = useQueryClient()

  const mutation = usePostAdminTenantsByIdKeys({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({
          queryKey: getGetAdminTenantsByIdKeysQueryKey(tenantId),
        })
        onSuccess?.(response.data)
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không cấp được API key",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  const issueApiKey = (label: string) => {
    const trimmed = label.trim()
    return mutation.mutateAsync({
      id: tenantId,
      data: { label: trimmed || null },
    })
  }

  return {
    issueApiKey,
    isPending: mutation.isPending,
    reset: mutation.reset,
  }
}

export function useRevokeApiKey(tenantId: number) {
  const queryClient = useQueryClient()

  const mutation = useDeleteAdminTenantsByIdKeysByApiKeyId({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetAdminTenantsByIdKeysQueryKey(tenantId),
        })
        toast.add({
          type: "success",
          title: "Đã thu hồi API key",
          description: "Client đang dùng key này sẽ nhận 401 ngay lập tức.",
        })
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không thu hồi được API key",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  const revokeApiKey = (apiKeyId: number) =>
    mutation.mutateAsync({ id: tenantId, apiKeyId })

  return { revokeApiKey, isPending: mutation.isPending }
}
