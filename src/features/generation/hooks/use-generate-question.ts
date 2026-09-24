import { useState } from "react"

import {
  usePostEnglishGenerateByQuizType,
  usePostEnglishGenerateReading,
} from "@/apis/english-generation/english-generation.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import { READING_QUIZ_TYPE } from "../constants.ts"
import type { GenerateFormValues, GeneratedQuestionView } from "../types.ts"
import { normalizeGeneratedQuestion } from "../utils/normalize-generated-question.ts"
import { parseExcludeWords } from "../utils/validate-generate.ts"

export function useGenerateQuestion() {
  const [view, setView] = useState<GeneratedQuestionView>()
  const byQuizType = usePostEnglishGenerateByQuizType()
  const reading = usePostEnglishGenerateReading()

  const notifyError = (error: unknown) => {
    toast.add({
      type: "error",
      title: "Không tạo được câu hỏi",
      description: getApiErrorMessage(error),
    })
  }

  const generate = async (values: GenerateFormValues) => {
    const engLevel = values.engLevel
    const optionCount = values.optionCount
    const model = values.model.trim()

    try {
      if (values.quizType === READING_QUIZ_TYPE) {
        const response = await reading.mutateAsync({
          data: { engLevel, optionCount, ...(model ? { model } : {}) },
        })
        setView(normalizeGeneratedQuestion(response.data))
        return
      }

      const topic = values.topic.trim()
      const excludeWords = parseExcludeWords(values.excludeWords)

      const response = await byQuizType.mutateAsync({
        quizType: values.quizType,
        data: {
          engLevel,
          optionCount,
          ...(topic ? { topic } : {}),
          ...(model ? { model } : {}),
          ...(excludeWords.length > 0 ? { excludeWords } : {}),
          ...(values.forBeginner ? { forBeginner: true } : {}),
        },
      })
      setView(normalizeGeneratedQuestion(response.data))
    } catch (error) {
      notifyError(error)
    }
  }

  const reset = () => {
    setView(undefined)
    byQuizType.reset()
    reading.reset()
  }

  return {
    generate,
    view,
    isPending: byQuizType.isPending || reading.isPending,
    error: byQuizType.error ?? reading.error,
    reset,
  }
}
