import { useState } from "react"
import { IconCode } from "@tabler/icons-react"

import { JsonBlock } from "@/components/common/json-block.tsx"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { PoolReviewDiffItem } from "../types.ts"

function renderValue(value: unknown) {
  if (value === undefined)
    return <span className="text-muted-foreground">(không có)</span>
  if (value === null) return <span className="text-muted-foreground">null</span>
  if (typeof value === "string") {
    return value ? (
      <span className="wrap-break-word whitespace-pre-wrap">{value}</span>
    ) : (
      <span className="text-muted-foreground">(rỗng)</span>
    )
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return <span className="tabular-nums">{String(value)}</span>
  }
  return (
    <pre className="text-xs wrap-break-word whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

function SideBox({
  label,
  sign,
  tone,
  children,
}: {
  label: string
  sign: "−" | "+"
  tone: "before" | "after"
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          className={cn(
            "font-mono",
            tone === "before" ? "text-rose-600" : "text-emerald-600"
          )}
        >
          {sign}
        </span>
        {label}
      </p>
      <div
        className={cn(
          "rounded-xl p-2 text-sm",
          tone === "before"
            ? "bg-rose-500/5 dark:bg-rose-400/10"
            : "bg-emerald-500/5 dark:bg-emerald-400/10"
        )}
      >
        {children}
      </div>
    </div>
  )
}

function JsonToggle({ label, value }: { label: string; value: unknown }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        onClick={() => setOpen((v) => !v)}
      >
        <IconCode stroke={1.5} data-icon="inline-start" />
        {open ? "Ẩn" : label}
      </Button>
      {open ? (
        <JsonBlock value={value} scroll={false} className="mt-2" />
      ) : null}
    </div>
  )
}

export function QuestionDiffView({
  diff,
  original,
  revised,
}: {
  diff: PoolReviewDiffItem[]
  original: unknown
  revised: unknown
}) {
  return (
    <div className="space-y-4">
      {diff.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
          AI không đổi trường nào — bản sửa giống hệt bản gốc.
        </p>
      ) : (
        <div className="space-y-3">
          {diff.map((item) => (
            <div key={item.field} className="rounded-2xl border p-3">
              <p className="mb-2 font-mono text-xs font-medium text-amber-700 dark:text-amber-300">
                {item.field}
              </p>
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                <SideBox label="Bản gốc" sign="−" tone="before">
                  {renderValue(item.before)}
                </SideBox>
                <SideBox label="Bản sửa" sign="+" tone="after">
                  {renderValue(item.after)}
                </SideBox>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <JsonToggle label="Xem JSON gốc" value={original} />
        <JsonToggle label="Xem JSON bản sửa" value={revised} />
      </div>
    </div>
  )
}
