import { useMemo } from "react"

import { useGetEnglishCronUsage } from "@/apis/english-cron-tracking/english-cron-tracking.ts"

import type { UsageGroupBy } from "../constants.ts"

/** Đầu ngày hôm nay trừ đi `days` — dùng làm mốc `from` cho khoảng thống kê. */
export function usageRangeFrom(days: number): Date {
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  from.setDate(from.getDate() - days)
  return from
}

export function useCronUsage({
  days,
  groupBy,
}: {
  days: number
  groupBy: UsageGroupBy
}) {
  // Chỉ đổi khi `days` đổi, nếu không mỗi lần render sẽ ra `from` mới và query key
  // thay đổi liên tục.
  const from = useMemo(() => usageRangeFrom(days).toISOString(), [days])

  const query = useGetEnglishCronUsage({ from, groupBy })

  const items = useMemo(() => query.data?.data ?? [], [query.data])

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, item) => ({
          costUsd: acc.costUsd + item.costUsd,
          tokenIn: acc.tokenIn + item.tokenIn,
          tokenOut: acc.tokenOut + item.tokenOut,
          requestCount: acc.requestCount + item.requestCount,
        }),
        { costUsd: 0, tokenIn: 0, tokenOut: 0, requestCount: 0 }
      ),
    [items]
  )

  return {
    items,
    totals,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}
