import { useQueryClient } from "@tanstack/react-query"

import {
  getGetAdminTenantsByIdQuizTypesQueryKey,
  getGetAdminTenantsByIdTopicsQueryKey,
  useGetAdminTenantsByIdQuizTypes,
  useGetAdminTenantsByIdTopics,
  usePutAdminTenantsByIdQuizTypes,
  usePutAdminTenantsByIdTopics,
} from "@/apis/admin-grants/admin-grants.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

export function useTenantTopicGrants(tenantId: number) {
  const queryClient = useQueryClient()
  const query = useGetAdminTenantsByIdTopics(tenantId)

  const mutation = usePutAdminTenantsByIdTopics({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({
          queryKey: getGetAdminTenantsByIdTopicsQueryKey(tenantId),
        })
        toast.add({
          type: "success",
          title: "Đã lưu chủ đề được cấp",
          description: `Tenant hiện truy cập được ${response.data.topicIds.length} chủ đề.`,
        })
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không lưu được chủ đề",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  return {
    topicIds: query.data?.data.topicIds ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    saveTopicIds: (topicIds: number[]) =>
      mutation.mutateAsync({ id: tenantId, data: { topicIds } }),
    isSaving: mutation.isPending,
  }
}

export function useTenantQuizTypeGrants(tenantId: number) {
  const queryClient = useQueryClient()
  const query = useGetAdminTenantsByIdQuizTypes(tenantId)

  const mutation = usePutAdminTenantsByIdQuizTypes({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({
          queryKey: getGetAdminTenantsByIdQuizTypesQueryKey(tenantId),
        })
        toast.add({
          type: "success",
          title: "Đã lưu dạng quiz được cấp",
          description: `Tenant hiện truy cập được ${response.data.quizTypes.length} dạng quiz.`,
        })
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không lưu được dạng quiz",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  return {
    quizTypes: query.data?.data.quizTypes ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    saveQuizTypes: (quizTypes: string[]) =>
      mutation.mutateAsync({ id: tenantId, data: { quizTypes } }),
    isSaving: mutation.isPending,
  }
}
