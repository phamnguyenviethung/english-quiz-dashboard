import { IconCircleCheck } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

import type { GeneratedOption } from "../types.ts"

export function QuestionOptionList({
  options,
}: {
  options: GeneratedOption[]
}) {
  return (
    <ol className="space-y-2">
      {options.map((option, index) => (
        <li
          key={index}
          className={cn(
            "rounded-2xl border p-3",
            option.isCorrect && "border-primary/40 bg-primary/5"
          )}
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 font-mono text-xs text-muted-foreground">
              {String.fromCharCode(65 + index)}.
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  option.isCorrect && "font-medium"
                )}
              >
                {option.text}
              </p>
              {option.translation ? (
                <p className="text-xs text-muted-foreground italic">
                  {option.translation}
                </p>
              ) : null}
              {option.explanation ? (
                <p className="text-xs text-muted-foreground">
                  {option.explanation}
                </p>
              ) : null}
            </div>
            {option.isCorrect ? (
              <IconCircleCheck
                className="mt-0.5 size-4 shrink-0 text-primary"
                stroke={1.5}
              />
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
