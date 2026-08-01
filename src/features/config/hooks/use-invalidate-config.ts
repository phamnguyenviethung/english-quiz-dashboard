import { useQueryClient } from "@tanstack/react-query"

import {
  getGetEnglishConfigQueryKey,
  getGetEnglishConfigRecordsQueryKey,
} from "@/apis/english-config/english-config.ts"

export function useInvalidateConfig() {
  const queryClient = useQueryClient()

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getGetEnglishConfigRecordsQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetEnglishConfigQueryKey(),
      }),
    ])
  }
}
