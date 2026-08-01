import {
  getGetEnglishTopicsRandomPairsQueryOptions,
  useGetEnglishTopicsRandomPairs,
} from "@/apis/english-topics/english-topics.ts"

import type { TopicPair } from "../types.ts"

/** Sampler ngẫu nhiên: không cache, chỉ chạy khi bấm nút. */
export function useRandomTopicPairs(pairCount: number) {
  const params = { pairCount }
  const query = useGetEnglishTopicsRandomPairs(params, {
    query: {
      ...getGetEnglishTopicsRandomPairsQueryOptions(params),
      enabled: false,
      staleTime: 0,
      gcTime: 0,
    },
  })

  return {
    pairs: (query.data?.data ?? []) as TopicPair[],
    hasResult: query.data !== undefined,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    fetchPairs: query.refetch,
  }
}
