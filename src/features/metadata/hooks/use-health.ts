import { getGetHealthQueryOptions, useGetHealth } from "@/apis/health/health.ts"

import { HEALTH_POLL_MS } from "../constants.ts"

export function useHealth() {
  const query = useGetHealth({
    query: {
      ...getGetHealthQueryOptions(),
      refetchInterval: HEALTH_POLL_MS,
    },
  })

  return {
    status: query.data?.data.status,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}
