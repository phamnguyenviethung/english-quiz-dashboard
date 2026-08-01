import {
  getGetEnglishCronRunsByRunIdQueryOptions,
  useGetEnglishCronRunsByRunId,
} from "@/apis/english-cron-tracking/english-cron-tracking.ts"

export function useCronRunDetail(runId: string | undefined) {
  const key = runId ?? ""
  const query = useGetEnglishCronRunsByRunId(key, {
    query: {
      ...getGetEnglishCronRunsByRunIdQueryOptions(key),
      enabled: Boolean(runId),
    },
  })

  return {
    detail: query.data?.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
