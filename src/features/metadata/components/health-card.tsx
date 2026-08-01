import { IconActivityHeartbeat, IconRefresh } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { resolveStatusMeta } from "@/components/common/status-meta.ts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { HEALTH_POLL_MS, HEALTH_STATUS_META } from "../constants.ts"
import { useHealth } from "../hooks/use-health.ts"

export function HealthCard() {
  const { status, isPending, isError, error, refetch, isFetching } = useHealth()
  const meta = resolveStatusMeta(HEALTH_STATUS_META, status)
  const StatusIcon = meta.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconActivityHeartbeat
            className="size-4 text-muted-foreground"
            stroke={1.5}
          />
          <CardTitle>Health check</CardTitle>
        </div>
        <CardDescription>
          Tự kiểm tra mỗi {HEALTH_POLL_MS / 1000} giây.
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <IconRefresh stroke={1.5} data-icon="inline-start" />
            Kiểm tra
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isError ? (
          <QueryError
            title="Không gọi được health check"
            error={error}
            onRetry={() => void refetch()}
          />
        ) : isPending ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          <Badge variant={meta.variant}>
            {StatusIcon ? (
              <StatusIcon className="size-3.5" stroke={1.5} />
            ) : null}
            {meta.label}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
