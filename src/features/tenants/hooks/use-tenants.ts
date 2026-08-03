import { useMemo } from "react"

import { useGetAdminTenants } from "@/apis/admin-tenants/admin-tenants.ts"

import type { Tenant } from "../types.ts"

export function useTenants() {
  const query = useGetAdminTenants()

  const tenants = useMemo<Tenant[]>(() => {
    const items = query.data?.data ?? []
    // Tenant đang hoạt động lên trước, trong mỗi nhóm thì mới nhất lên trước.
    return [...items].sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
      return b.id - a.id
    })
  }, [query.data])

  return {
    tenants,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}
