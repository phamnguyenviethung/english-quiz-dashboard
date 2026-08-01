import { useGetEnglishConfig } from "@/apis/english-config/english-config.ts"

export function useConfigSnapshot() {
  const query = useGetEnglishConfig()

  return {
    snapshot: query.data?.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
