import { useGetAdminModelsCatalog } from "@/apis/admin-models/admin-models.ts"

/**
 * Catalog OpenRouter đổi rất chậm và backend đã cache 5 phút, nên giữ staleTime
 * dài để gõ tìm kiếm không bắn request liên tục.
 */
export function useModelCatalog({
  search,
  enabled = true,
}: {
  search: string
  enabled?: boolean
}) {
  const trimmed = search.trim()

  const query = useGetAdminModelsCatalog(
    trimmed ? { search: trimmed } : undefined,
    { query: { enabled, staleTime: 5 * 60_000 } }
  )

  return {
    models: query.data?.data ?? [],
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
