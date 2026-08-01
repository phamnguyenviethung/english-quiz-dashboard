import { useMemo } from "react"

import { useGetEnglishQuizTypes } from "@/apis/english-meta/english-meta.ts"
import { QUIZ_TYPES } from "@/features/quiz/constants.ts"

import { diffQuizTypes } from "../utils/diff-quiz-types.ts"

export function useQuizTypesDiff() {
  const query = useGetEnglishQuizTypes()

  const quizTypes = useMemo(() => query.data?.data ?? [], [query.data])
  const diff = useMemo(() => diffQuizTypes(quizTypes, QUIZ_TYPES), [quizTypes])

  return {
    quizTypes,
    diff,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
