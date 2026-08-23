import { useMemo } from "react"

import { useGetEnglishCronUsage } from "@/apis/english-cron-tracking/english-cron-tracking.ts"
import { usageRangeFrom } from "@/features/cron-runs/hooks/use-cron-usage.ts"

import { DASHBOARD_USAGE_RANGE_DAYS } from "../constants.ts"

export interface DashboardModelRow {
  model: string
  requestCount: number
  costUsd: number
  tokenIn: number
  tokenOut: number
  successCount: number
  failedCount: number
  errorRate: number
}

export function useDashboardUsage() {
  const from = useMemo(
    () => usageRangeFrom(DASHBOARD_USAGE_RANGE_DAYS).toISOString(),
    []
  )

  const query = useGetEnglishCronUsage({ from, groupBy: "model" })

  const items = useMemo(() => query.data?.data ?? [], [query.data])

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, item) => ({
          costUsd: acc.costUsd + item.costUsd,
          tokenIn: acc.tokenIn + item.tokenIn,
          tokenOut: acc.tokenOut + item.tokenOut,
          requestCount: acc.requestCount + item.requestCount,
          successCount: acc.successCount + item.successCount,
          failedCount: acc.failedCount + item.failedCount,
        }),
        {
          costUsd: 0,
          tokenIn: 0,
          tokenOut: 0,
          requestCount: 0,
          successCount: 0,
          failedCount: 0,
        }
      ),
    [items]
  )

  const errorRate =
    totals.successCount + totals.failedCount === 0
      ? 0
      : totals.failedCount / (totals.successCount + totals.failedCount)

  // Sort theo lượt gọi (không theo error rate) — tránh model gọi 1 lần, lỗi 1
  // lần nhảy lên đầu bảng dù không đại diện cho gì cả.
  const modelRows = useMemo<DashboardModelRow[]>(
    () =>
      [...items]
        .sort((a, b) => b.requestCount - a.requestCount)
        .map((item) => ({
          model: item.bucket,
          requestCount: item.requestCount,
          costUsd: item.costUsd,
          tokenIn: item.tokenIn,
          tokenOut: item.tokenOut,
          successCount: item.successCount,
          failedCount: item.failedCount,
          errorRate:
            item.successCount + item.failedCount === 0
              ? 0
              : item.failedCount / (item.successCount + item.failedCount),
        })),
    [items]
  )

  return {
    modelRows,
    totals: { ...totals, errorRate },
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}
