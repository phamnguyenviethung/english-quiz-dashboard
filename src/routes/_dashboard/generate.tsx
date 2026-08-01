import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { IconSparkles } from "@tabler/icons-react"

import { PageHeader } from "@/components/common/page-header.tsx"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { GenerateForm } from "@/features/generation/components/generate-form.tsx"
import { GeneratedQuestionCard } from "@/features/generation/components/generated-question-card.tsx"
import {
  DEFAULT_GENERATE_VALUES,
  GENERATE_OPTION_COUNTS,
  GENERATE_QUIZ_TYPES,
} from "@/features/generation/constants.ts"
import { useGenerateQuestion } from "@/features/generation/hooks/use-generate-question.ts"
import type {
  GenerateFormErrors,
  GenerateFormValues,
  GenerateOptionCount,
  GenerateQuizType,
} from "@/features/generation/types.ts"
import {
  hasErrors,
  validateGenerateForm,
} from "@/features/generation/utils/validate-generate.ts"
import { ENG_LEVELS } from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"

interface GenerateSearch {
  quizType?: GenerateQuizType
  engLevel?: EngLevel
  optionCount?: GenerateOptionCount
  topic?: string
}

export const Route = createFileRoute("/_dashboard/generate")({
  validateSearch: (search: Record<string, unknown>): GenerateSearch => {
    const quizType = GENERATE_QUIZ_TYPES.find(
      (type) => type === search.quizType
    )
    const engLevel = ENG_LEVELS.find((level) => level === search.engLevel)
    const optionCount = GENERATE_OPTION_COUNTS.find(
      (count) => count === Number(search.optionCount)
    )
    const topic =
      typeof search.topic === "string" && search.topic
        ? search.topic
        : undefined

    return {
      ...(quizType ? { quizType } : {}),
      ...(engLevel ? { engLevel } : {}),
      ...(optionCount ? { optionCount } : {}),
      ...(topic ? { topic } : {}),
    }
  },
  component: GeneratePage,
})

function GeneratePage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [freeText, setFreeText] = useState({ model: "", excludeWords: "" })
  const [errors, setErrors] = useState<GenerateFormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const { generate, view, isPending, reset } = useGenerateQuestion()

  const values: GenerateFormValues = {
    quizType: search.quizType ?? DEFAULT_GENERATE_VALUES.quizType,
    engLevel: search.engLevel ?? DEFAULT_GENERATE_VALUES.engLevel,
    optionCount: search.optionCount ?? DEFAULT_GENERATE_VALUES.optionCount,
    topic: search.topic ?? "",
    ...freeText,
  }

  const handleChange = (patch: Partial<GenerateFormValues>) => {
    const { model, excludeWords, ...searchPatch } = patch

    if (model !== undefined || excludeWords !== undefined) {
      setFreeText((prev) => ({
        model: model ?? prev.model,
        excludeWords: excludeWords ?? prev.excludeWords,
      }))
    }

    if (Object.keys(searchPatch).length > 0) {
      void navigate({
        search: (prev) => ({
          ...prev,
          ...searchPatch,
          ...("topic" in searchPatch && !searchPatch.topic
            ? { topic: undefined }
            : {}),
        }),
        replace: true,
      })
    }

    if (submitted) {
      setErrors(validateGenerateForm({ ...values, ...patch }))
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
    const nextErrors = validateGenerateForm(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    reset()
    void generate(values)
  }

  return (
    <>
      <PageHeader
        title="Tạo câu hỏi"
        description="Thử nghiệm prompt và model. Câu hỏi tạo ra ở đây không được lưu vào kho."
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
        <div className="lg:sticky lg:top-20">
          <GenerateForm
            values={values}
            errors={errors}
            isPending={isPending}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </div>

        {isPending ? (
          <div className="space-y-3 rounded-2xl border p-6">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : view ? (
          <GeneratedQuestionCard view={view} />
        ) : (
          <Empty className="rounded-2xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconSparkles stroke={1.5} />
              </EmptyMedia>
              <EmptyTitle>Chưa tạo câu hỏi nào</EmptyTitle>
              <EmptyDescription>
                Chọn loại câu hỏi và cấp độ ở bên trái, rồi bấm "Tạo câu hỏi" để
                xem kết quả.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </>
  )
}
