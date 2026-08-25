import { keepPreviousData } from "@tanstack/react-query"

import { useGetAdminReadingQuestions } from "@/apis/admin-reading-questions/admin-reading-questions.ts"
import type { GetAdminReadingQuestionsParams } from "@/apis/model"

import { READING_QUESTIONS_PAGE_SIZE } from "../constants.ts"

export interface ReadingQuestionsFilterInput {
  q: string | undefined
  cefrLevel: GetAdminReadingQuestionsParams["cefrLevel"]
  topicId: number | undefined
  passageId: number | undefined
  type: GetAdminReadingQuestionsParams["type"]
  quizType: string | undefined
  model: string | undefined
  isActive: boolean | undefined
  sort: GetAdminReadingQuestionsParams["sort"]
  page: number
  pageSize: number
}

export function buildReadingQuestionsParams({
  q,
  cefrLevel,
  topicId,
  passageId,
  type,
  quizType,
  model,
  isActive,
  sort,
  page,
  pageSize,
}: ReadingQuestionsFilterInput): GetAdminReadingQuestionsParams {
  return {
    ...(q ? { q } : {}),
    ...(cefrLevel ? { cefrLevel } : {}),
    ...(topicId ? { topicId } : {}),
    ...(passageId ? { passageId } : {}),
    ...(type ? { type } : {}),
    ...(quizType ? { quizType } : {}),
    ...(model ? { model } : {}),
    ...(isActive === undefined ? {} : { isActive }),
    ...(sort ? { sort } : {}),
    page,
    pageSize,
  }
}

export function useReadingQuestions(
  params: GetAdminReadingQuestionsParams,
  options: { enabled?: boolean } = {}
) {
  const query = useGetAdminReadingQuestions(params, {
    query: {
      enabled: options.enabled ?? true,
      placeholderData: keepPreviousData,
    },
  })

  const data = query.data?.data

  return {
    items: data?.items,
    page: data?.page ?? Number(params.page ?? 1),
    pageSize: data?.pageSize ?? READING_QUESTIONS_PAGE_SIZE,
    total: data?.total,
    totalPages: data?.totalPages ?? 1,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}
