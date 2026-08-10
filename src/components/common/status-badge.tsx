import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { StatusMeta } from "./status-meta.ts"
import { STATUS_TONE_CLASS } from "./status-meta.ts"

/**
 * Badge trạng thái có màu ngữ nghĩa. Khi `meta.tone` được đặt thì lấy variant
 * "secondary" làm nền (border trong suốt) rồi để tone ghi đè bg/text — tailwind-merge
 * cho class sau thắng nên không cần variant riêng cho từng tone.
 */
export function StatusBadge({
  meta,
  className,
}: {
  meta: StatusMeta
  className?: string
}) {
  const StatusIcon = meta.icon

  return (
    <Badge
      variant={meta.tone ? "secondary" : meta.variant}
      className={cn(meta.tone && STATUS_TONE_CLASS[meta.tone], className)}
    >
      {StatusIcon ? <StatusIcon stroke={1.5} data-icon="inline-start" /> : null}
      {meta.label}
    </Badge>
  )
}
