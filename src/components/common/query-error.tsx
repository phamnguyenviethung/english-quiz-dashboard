import { IconAlertOctagon, IconRefresh } from "@tabler/icons-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/lib/api-error.ts"

export function QueryError({
  title = "Không tải được dữ liệu",
  error,
  onRetry,
}: {
  title?: string
  error: unknown
  onRetry?: () => void
}) {
  return (
    <Alert variant="destructive">
      <IconAlertOctagon stroke={1.5} />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
      {onRetry ? (
        <AlertAction>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <IconRefresh stroke={1.5} data-icon="inline-start" />
            Thử lại
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  )
}
