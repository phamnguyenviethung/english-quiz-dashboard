import { useMemo } from "react"

import { useGetEnglishConfigRecords } from "@/apis/english-config/english-config.ts"

import { groupConfigRecords } from "../utils/group-config-records.ts"

export function useConfigRecords() {
  const query = useGetEnglishConfigRecords()

  const records = useMemo(() => query.data?.data ?? [], [query.data])
  const groups = useMemo(() => groupConfigRecords(records), [records])

  return {
    records,
    groups,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}
