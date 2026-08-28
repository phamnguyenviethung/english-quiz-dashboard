import { Badge } from "@/components/ui/badge"

import { getReviewStatusMeta, getReviewVerdictMeta } from "../constants.ts"

export function ReviewStatusBadge({ status }: { status: string }) {
  const meta = getReviewStatusMeta(status)
  return (
    <Badge variant="secondary" className={meta.className}>
      {meta.label}
    </Badge>
  )
}

export function ReviewVerdictBadge({ verdict }: { verdict: string | null }) {
  if (!verdict) return <span className="text-muted-foreground">-</span>
  const meta = getReviewVerdictMeta(verdict)
  return (
    <Badge variant="secondary" className={meta.className}>
      {meta.label}
    </Badge>
  )
}
