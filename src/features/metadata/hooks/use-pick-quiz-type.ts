import {
  getGetEnglishPoolPickQuizTypeQueryOptions,
  useGetEnglishPoolPickQuizType,
} from "@/apis/english-question-pool/english-question-pool.ts"

/** Sampler ngẫu nhiên: không cache, chỉ chạy khi bấm nút. */
export function usePickQuizType() {
  const query = useGetEnglishPoolPickQuizType({
    query: {
      ...getGetEnglishPoolPickQuizTypeQueryOptions(),
      enabled: false,
      staleTime: 0,
      gcTime: 0,
    },
  })

  return {
    quizType: query.data?.data.quizType,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    pick: query.refetch,
  }
}
