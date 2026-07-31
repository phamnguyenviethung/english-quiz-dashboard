import { QueryClient } from "@tanstack/react-query"

import { getHttpStatus } from "@/lib/api-error.ts"

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status = getHttpStatus(error)
          if (status !== undefined && status >= 400 && status < 500)
            return false
          return failureCount < 2
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}
