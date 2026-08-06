import { useMemo } from "react"

import { useGetAdminModels } from "@/apis/admin-models/admin-models.ts"

import type { AiModel } from "../types.ts"

export function useAiModels() {
  const query = useGetAdminModels()

  const models = useMemo<AiModel[]>(() => {
    const items = query.data?.data ?? []
    // Model đang hoạt động lên trước, trong mỗi nhóm thì mới nhất lên trước.
    return [...items].sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
      return b.id - a.id
    })
  }, [query.data])

  return {
    models,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}
