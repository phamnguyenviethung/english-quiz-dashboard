import type { Icon } from "@tabler/icons-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type StatTone = "default" | "success" | "danger" | "muted"

const TONE_CLASS: Record<StatTone, string> = {
  default: "text-foreground",
  success: "text-foreground",
  danger: "text-destructive",
  muted: "text-muted-foreground",
}

export function StatTile({
  label,
  value,
  hint,
  icon: TileIcon,
  tone = "default",
  className,
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: Icon
  tone?: StatTone
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border p-4", className)}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {TileIcon ? <TileIcon className="size-3.5" stroke={1.5} /> : null}
        <span>{label}</span>
      </div>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          TONE_CLASS[tone]
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function StatTileGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  )
}
