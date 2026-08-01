import { useMemo } from "react"

import { useGetEnglishCronRuns } from "@/apis/english-cron-tracking/english-cron-tracking.ts"

import { ALL_STATUS_VALUE } from "../constants.ts"

export function useCronRuns({
  limit,
  status,
}: {
  limit: number
  status: string
}) {
  const query = useGetEnglishCronRuns({ limit })

  const runs = useMemo(() => {
    const items = query.data?.data ?? []
    return status === ALL_STATUS_VALUE
      ? items
      : items.filter((run) => run.status === status)
  }, [query.data, status])

  const statuses = useMemo(
    () => [...new Set((query.data?.data ?? []).map((run) => run.status))],
    [query.data]
  )

  return {
    runs,
    statuses,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}
