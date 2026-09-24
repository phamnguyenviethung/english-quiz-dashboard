import { Link } from "@tanstack/react-router"
import { IconAlertTriangle } from "@tabler/icons-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { QUIZ_TYPE_META } from "@/features/quiz/constants.ts"
import { cn } from "@/lib/utils"

import type { BeginnerQuizTypeState } from "../hooks/use-beginner-hub.ts"
import { useUpdateBeginnerQuizTypes } from "../hooks/use-update-beginner-quiz-types.ts"

export function BeginnerQuizTypesPanel({
  quizTypes,
  isPending,
}: {
  quizTypes: BeginnerQuizTypeState[]
  isPending: boolean
}) {
  const { setEnabled, isPending: isSaving } = useUpdateBeginnerQuizTypes()

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-busy={isSaving}>
      {quizTypes.map((item) => {
        const meta = QUIZ_TYPE_META[item.quizType]
        const ItemIcon = meta.icon
        const switchId = `beginner-quiz-type-${item.quizType}`
        const isEffective = item.enabled && !item.globallyDisabled
        return (
          <div
            key={item.quizType}
            className={cn(
              "flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2 transition-colors",
              isEffective && "border-emerald-500/40 bg-emerald-500/5"
            )}
          >
            <ItemIcon
              className="size-5 shrink-0 text-muted-foreground"
              stroke={1.5}
              aria-hidden
            />
            <label
              htmlFor={switchId}
              className="flex min-w-0 flex-1 cursor-pointer flex-col"
            >
              <span className="truncate text-sm font-medium">{meta.label}</span>
              {item.globallyDisabled ? (
                <span className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
                  <IconAlertTriangle
                    className="size-3.5 shrink-0"
                    stroke={1.5}
                    aria-hidden
                  />
                  Đang tắt ở{" "}
                  <Link to="/config" className="underline underline-offset-2">
                    phân bổ chung
                  </Link>
                </span>
              ) : (
                <span className="font-mono text-xs text-muted-foreground">
                  {item.quizType}
                </span>
              )}
            </label>
            <Switch
              id={switchId}
              checked={item.enabled}
              disabled={isSaving}
              onCheckedChange={(checked) =>
                void setEnabled(quizTypes, item.quizType, checked)
              }
            />
          </div>
        )
      })}
    </div>
  )
}
