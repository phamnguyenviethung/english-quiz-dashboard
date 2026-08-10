import { useMemo } from "react"

import { useGetAdminModels } from "@/apis/admin-models/admin-models.ts"

import type { AiModel } from "../types.ts"

export function useAiModels() {
  const query = useGetAdminModels()

  const models = useMemo<AiModel[]>(() => {
    const items = query.data?.data ?? []
    // Sắp theo modelId tăng dần để model cùng provider nằm liền khối. `numeric`
    // để "gpt-5" đứng trước "gpt-10" thay vì sau khi so từng ký tự.
    return [...items].sort((a, b) =>
      a.modelId.localeCompare(b.modelId, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    )
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
