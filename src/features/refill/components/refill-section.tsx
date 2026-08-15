import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Một khối cấu hình trong cột trái. Các khối ngăn nhau bằng `divide-y` ở container. */
export function RefillSection({
  title,
  description,
  className,
  children,
}: {
  title: string
  description: string
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}
