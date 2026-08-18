import { IconCheck } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import {
  getReadingQuestionTypeLabel,
  isAutoGeneratableType,
} from "../constants.ts"
import type { ReadingQuestionView } from "../types.ts"

export function ReadingQuestionTypeBadge({ quizType }: { quizType: string }) {
  const label = getReadingQuestionTypeLabel(quizType)

  if (isAutoGeneratableType(quizType)) {
    return <Badge variant="secondary">{label}</Badge>
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<Badge variant="outline">{label}</Badge>} />
      <TooltipContent>
        Model không tự sinh loại này, chỉ có khi admin sửa tay.
      </TooltipContent>
    </Tooltip>
  )
}

/** Render 1 câu hỏi. Dùng chung cho sheet chi tiết, panel trong bài đọc và dialog sinh thử. */
export function ReadingQuestionBody({
  question,
  index,
  className,
}: {
  question: ReadingQuestionView
  index?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {index === undefined ? null : (
          <span className="font-mono text-xs text-muted-foreground">
            Câu {index + 1}
          </span>
        )}
        <ReadingQuestionTypeBadge quizType={question.quizType} />
      </div>

      <p className="text-sm leading-relaxed font-medium">{question.question}</p>

      <ol className="space-y-1.5 text-sm">
        {question.options.map((option, optionIndex) => {
          const isCorrect = optionIndex === question.correctAnswer
          return (
            <li key={optionIndex} className="flex items-start gap-2">
              <span
                className={cn(
                  "font-mono text-xs leading-5",
                  isCorrect
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-muted-foreground"
                )}
              >
                {String.fromCharCode(65 + optionIndex)}.
              </span>
              <span
                className={cn(
                  isCorrect &&
                    "font-medium text-emerald-700 dark:text-emerald-300"
                )}
              >
                {option}
              </span>
              {isCorrect ? (
                <IconCheck
                  stroke={1.5}
                  className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300"
                  aria-label="Đáp án đúng"
                />
              ) : null}
            </li>
          )
        })}
      </ol>

      <p className="text-sm text-muted-foreground">{question.explanation}</p>
    </div>
  )
}
