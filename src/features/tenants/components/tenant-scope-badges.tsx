import { Badge } from "@/components/ui/badge"

import { SCOPE_BADGE_LIMIT, getScopeLabel } from "../constants.ts"

export function TenantScopeBadges({
  scopes,
  limit = SCOPE_BADGE_LIMIT,
}: {
  scopes: string[]
  limit?: number
}) {
  const usable = scopes.filter((scope) => scope.trim().length > 0)
  if (usable.length === 0) {
    return <span className="text-xs text-muted-foreground">Chưa cấp scope</span>
  }

  const visible = usable.slice(0, limit)
  const hiddenCount = usable.length - visible.length

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((scope) => (
        <Badge key={scope} variant="outline" className="font-normal">
          {getScopeLabel(scope)}
        </Badge>
      ))}
      {hiddenCount > 0 ? (
        <Badge variant="ghost" className="font-normal">
          +{hiddenCount}
        </Badge>
      ) : null}
    </div>
  )
}
