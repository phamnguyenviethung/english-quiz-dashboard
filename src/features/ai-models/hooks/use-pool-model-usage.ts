import { useMemo } from "react"

import { useGetEnglishPoolModels } from "@/apis/english-question-pool/english-question-pool.ts"

/**
 * Đếm số câu đã sinh trong pool theo từng model string, để hiển thị cạnh
 * danh sách ai_models. Nguồn dữ liệu khác bảng ai_models — pool count còn giữ
 * cả model đã bị gỡ khỏi config (xem docs/question-pool.md).
 */
export function usePoolModelUsage() {
  const query = useGetEnglishPoolModels({
    query: { staleTime: 5 * 60_000 },
  })

  const usageByModelId = useMemo(() => {
    const map = new Map<string, number>()
    for (const stat of query.data?.data ?? []) {
      map.set(stat.model, stat.count)
    }
    return map
  }, [query.data])

  return { usageByModelId, isPending: query.isPending }
}
