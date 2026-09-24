import { IconSeedling } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { BEGINNER_BADGE_CLASS } from "../constants.ts"

export function BeginnerBadge({
  label = "Người mới",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <Badge variant="secondary" className={cn(BEGINNER_BADGE_CLASS, className)}>
      <IconSeedling stroke={1.75} data-icon="inline-start" aria-hidden />
      {label}
    </Badge>
  )
}
