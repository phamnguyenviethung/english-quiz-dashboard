import { keepPreviousData } from "@tanstack/react-query"

import { useGetEnglishPoolQuestions } from "@/apis/english-question-pool/english-question-pool.ts"
import type { GetEnglishPoolQuestionsParams } from "@/apis/model"

import { QUESTIONS_PAGE_SIZE } from "../constants.ts"

export interface PoolQuestionsFilterInput {
  q: string | undefined
  engLevel: GetEnglishPoolQuestionsParams["engLevel"]
  quizType: GetEnglishPoolQuestionsParams["quizType"]
  topicId: number | undefined
  noTopic: boolean
  model: string | undefined
  optionCount: number | undefined
  createdFrom: string | undefined
  createdTo: string | undefined
  sort: GetEnglishPoolQuestionsParams["sort"]
  page: number
  pageSize: number
}

export function buildPoolQuestionsParams({
  q,
  engLevel,
  quizType,
  topicId,
  noTopic,
  model,
  optionCount,
  createdFrom,
  createdTo,
  sort,
  page,
  pageSize,
}: PoolQuestionsFilterInput): GetEnglishPoolQuestionsParams {
  return {
    ...(q ? { q } : {}),
    ...(engLevel ? { engLevel } : {}),
    ...(quizType ? { quizType } : {}),
    ...(noTopic ? { withoutTopic: true } : topicId ? { topicId } : {}),
    ...(model ? { model } : {}),
    ...(optionCount ? { optionCount } : {}),
    ...(createdFrom ? { createdFrom } : {}),
    ...(createdTo ? { createdTo } : {}),
    ...(sort ? { sort } : {}),
    page,
    pageSize,
  }
}

export function usePoolQuestions(params: GetEnglishPoolQuestionsParams) {
  const query = useGetEnglishPoolQuestions(params, {
    // Giữ trang cũ khi đang fetch trang mới để bảng không nháy skeleton mỗi lần đổi trang.
    query: { placeholderData: keepPreviousData },
  })

  const data = query.data?.data

  return {
    items: data?.items,
    page: data?.page ?? params.page ?? 1,
    pageSize: data?.pageSize ?? QUESTIONS_PAGE_SIZE,
    total: data?.total,
    totalPages: data?.totalPages ?? 1,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
  }
}
