import { IconCheck, IconMinus } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

import { CHECKLIST_LABELS, CHECKLIST_POSITIVE_WHEN_TRUE } from "../constants.ts"
import type { PoolReview } from "../types.ts"

// checklist là object cùng shape ở list/detail/approve — nhận generic record boolean.
type ChecklistLike = NonNullable<PoolReview["checklist"]>

export function ReviewChecklist({
  checklist,
}: {
  checklist: ChecklistLike | null | undefined
}) {
  if (!checklist) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có checklist (review lỗi hoặc chưa chạy xong).
      </p>
    )
  }

  const entries = Object.entries(checklist)

  return (
    <ul className="grid gap-1.5 sm:grid-cols-2">
      {entries.map(([key, value]) => {
        const positiveWhenTrue = CHECKLIST_POSITIVE_WHEN_TRUE.has(key)
        // "Đáng chú ý" = có thay đổi/vấn đề (value=true) trừ cờ formatValid (true=tốt).
        const flagged = positiveWhenTrue ? !value : value

        return (
          <li key={key} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full",
                flagged
                  ? "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {flagged ? (
                <IconCheck className="size-3" stroke={2.5} />
              ) : (
                <IconMinus className="size-3" stroke={2.5} />
              )}
            </span>
            <span className={cn(!flagged && "text-muted-foreground")}>
              {CHECKLIST_LABELS[key] ?? key}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
