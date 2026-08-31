import { useState } from "react"
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"

import { CHECKLIST_LABELS, CHECKLIST_ORDER } from "../constants.ts"
import type { PoolReview } from "../types.ts"

// checklist là object cùng shape ở list/detail/approve — nhận generic record boolean.
type ChecklistLike = NonNullable<PoolReview["checklist"]>

function orderIndex(key: string): number {
  const i = CHECKLIST_ORDER.indexOf(key)
  return i === -1 ? CHECKLIST_ORDER.length : i
}

export function ReviewChecklist({
  checklist,
}: {
  checklist: ChecklistLike | null | undefined
}) {
  const [showPassing, setShowPassing] = useState(false)

  if (!checklist) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có checklist (review lỗi hoặc chưa chạy xong).
      </p>
    )
  }

  const record = checklist as Record<string, boolean | undefined>
  const formatValid = record.formatValid

  const entries = Object.entries(record)
    .filter(([key]) => key !== "formatValid")
    .sort(([a], [b]) => orderIndex(a) - orderIndex(b))

  const flagged = entries.filter(([, value]) => value === true)
  const passing = entries.filter(([, value]) => value !== true)

  return (
    <div className="space-y-2">
      {flagged.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl border-l-2 border-emerald-500 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          <IconCheck stroke={2} className="size-4 shrink-0" />
          AI không phát hiện vấn đề nào ở bản gốc.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {flagged.map(([key]) => (
            <li
              key={key}
              className="flex min-h-9 items-center gap-2 rounded-xl border-l-2 border-amber-500 bg-amber-500/5 px-3 py-1.5 text-sm text-amber-800 dark:text-amber-200"
            >
              <IconAlertTriangle stroke={1.75} className="size-4 shrink-0" />
              {CHECKLIST_LABELS[key] ?? key}
            </li>
          ))}
        </ul>
      )}

      {formatValid === false ? (
        <p className="flex min-h-9 items-center gap-2 rounded-xl border-l-2 border-rose-500 bg-rose-500/10 px-3 py-1.5 text-sm text-rose-700 dark:text-rose-300">
          <IconAlertTriangle stroke={1.75} className="size-4 shrink-0" />
          Bản AI sửa không đúng schema câu hỏi — cần mở tab “Sửa tay”.
        </p>
      ) : formatValid === true ? (
        <p className="flex min-h-9 items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground">
          <IconCheck stroke={2} className="size-4 shrink-0 text-emerald-600" />
          Bản AI sửa đúng schema câu hỏi.
        </p>
      ) : null}

      {passing.length > 0 ? (
        <div>
          <button
            type="button"
            onClick={() => setShowPassing((value) => !value)}
            className="flex min-h-9 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <IconChevronDown
              stroke={1.75}
              className={cn(
                "size-4 transition-transform",
                showPassing && "rotate-180"
              )}
            />
            {passing.length} mục khác đạt
          </button>
          {showPassing ? (
            <ul className="mt-1 grid gap-1 sm:grid-cols-2">
              {passing.map(([key]) => (
                <li
                  key={key}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground"
                >
                  <IconCheck stroke={2} className="size-3.5 shrink-0" />
                  {CHECKLIST_LABELS[key] ?? key}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
