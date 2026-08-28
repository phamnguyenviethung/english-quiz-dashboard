import { CollapsibleJson } from "@/components/common/json-block.tsx"
import { cn } from "@/lib/utils"

import type { PoolReviewDiffItem } from "../types.ts"

function renderValue(value: unknown) {
  if (value === undefined)
    return <span className="text-muted-foreground">(không có)</span>
  if (value === null) return <span className="text-muted-foreground">null</span>
  if (typeof value === "string") {
    return value ? (
      <span className="whitespace-pre-wrap">{value}</span>
    ) : (
      <span className="text-muted-foreground">(rỗng)</span>
    )
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return <span className="tabular-nums">{String(value)}</span>
  }
  return (
    <pre className="max-h-48 overflow-auto rounded-xl bg-muted p-2 text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Bản gốc</p>
                  <div
                    className={cn(
                      "rounded-xl bg-rose-500/5 p-2 text-sm",
                      "dark:bg-rose-400/10"
                    )}
                  >
                    {renderValue(item.before)}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Bản sửa</p>
                  <div
                    className={cn(
                      "rounded-xl bg-emerald-500/5 p-2 text-sm",
                      "dark:bg-emerald-400/10"
                    )}
                  >
                    {renderValue(item.after)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <CollapsibleJson label="Xem toàn bộ dữ liệu gốc" value={original} />
        <CollapsibleJson label="Xem toàn bộ dữ liệu bản sửa" value={revised} />
      </div>
    </div>
  )
}
