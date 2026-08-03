import { useGetAdminTenantsById } from "@/apis/admin-tenants/admin-tenants.ts"

export function useTenant(tenantId: number) {
  const query = useGetAdminTenantsById(tenantId)

  return {
    tenant: query.data?.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}
