import { useGetEnglishPoolModels } from "@/apis/english-question-pool/english-question-pool.ts"
import type { PoolModelStat } from "../types.ts"

const EMPTY_MODELS: PoolModelStat[] = []

/**
 * Danh sách model đang có câu trong pool, dùng đổ dropdown filter.
 * Tập model chỉ đổi khi có job sinh câu mới nên cache dài, không cần refetch thường xuyên.
 */
export function usePoolModels() {
  const query = useGetEnglishPoolModels({
    query: { staleTime: 5 * 60_000 },
  })

  return {
    models: query.data?.data ?? EMPTY_MODELS,
    isPending: query.isPending,
    isError: query.isError,
  }
}
