import { keepPreviousData } from "@tanstack/react-query"

import { useGetEnglishPoolQuestions } from "@/apis/english-question-pool/english-question-pool.ts"
import type { GetEnglishPoolQuestionsParams } from "@/apis/model"

import { QUESTIONS_PAGE_SIZE } from "../constants.ts"

export function buildPoolQuestionsParams({
  q,
  engLevel,
  quizType,
  topicId,
  noTopic,
  sort,
  page,
}: {
  q: string | undefined
  engLevel: GetEnglishPoolQuestionsParams["engLevel"]
  quizType: GetEnglishPoolQuestionsParams["quizType"]
  topicId: number | undefined
  noTopic: boolean
  sort: GetEnglishPoolQuestionsParams["sort"]
  page: number
}): GetEnglishPoolQuestionsParams {
  return {
    ...(q ? { q } : {}),
    ...(engLevel ? { engLevel } : {}),
    ...(quizType ? { quizType } : {}),
    ...(noTopic ? { withoutTopic: true } : topicId ? { topicId } : {}),
    ...(sort ? { sort } : {}),
    page,
    pageSize: QUESTIONS_PAGE_SIZE,
  }
}

export function usePoolQuestions(params: GetEnglishPoolQuestionsParams) {
  const query = useGetEnglishPoolQuestions(params, {
    // Giữ trang cũ khi đang fetch trang mới để bảng không nháy skeleton mỗi lần đổi trang.
    query: { placeholderData: keepPreviousData },
  })

  const data = query.data?.data

  return {
    items: data?.items ?? [],
    page: data?.page ?? params.page ?? 1,
    pageSize: data?.pageSize ?? QUESTIONS_PAGE_SIZE,
    total: data?.total,
    totalPages: data?.totalPages ?? 1,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}
