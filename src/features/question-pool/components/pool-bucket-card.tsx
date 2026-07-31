import { IconRefresh, IconSparkles } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { getApiErrorMessage } from "@/lib/api-error.ts"
import { formatNumber } from "@/lib/format.ts"

import {
  POOL_STATUS_META,
  QUIZ_TYPE_META,
  getPoolStatus,
} from "../constants.ts"
import type { PoolCoverageCell } from "../types.ts"

export function PoolBucketCard({
  cell,
  isGenerating,
  isFilling,
  onFill,
}: {
  cell: PoolCoverageCell
  isGenerating: boolean
  isFilling: boolean
  onFill: () => void
}) {
  const meta = QUIZ_TYPE_META[cell.quizType]
  const status =
    cell.count === undefined
      ? undefined
      : POOL_STATUS_META[getPoolStatus(cell.count)]

  return (
    <div className="flex flex-col gap-4 rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <meta.icon className="size-4 text-muted-foreground" stroke={1.5} />
          <span className="text-sm font-medium">{meta.label}</span>
        </div>
        {isGenerating ? (
          <Badge variant="outline" className="gap-1">
            <Spinner />
            Đang tạo
          </Badge>
        ) : status ? (
          <Badge variant={status.variant}>{status.label}</Badge>
        ) : null}
      </div>

      <div className="min-h-9">
        {cell.isPending ? (
          <Skeleton className="h-8 w-16" />
        ) : cell.isError ? (
          <p className="text-xs text-destructive">
            {getApiErrorMessage(cell.error)}
          </p>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tabular-nums">
              {formatNumber(cell.count)}
            </span>
            <span className="text-xs text-muted-foreground">câu</span>
          </div>
        )}
      </div>

      {cell.isError ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={cell.refetch}
          className="justify-start"
        >
          <IconRefresh stroke={1.5} data-icon="inline-start" />
          Thử lại
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onFill}
          disabled={isFilling}
          className="justify-start"
        >
          {isFilling ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <IconSparkles stroke={1.5} data-icon="inline-start" />
          )}
          Tạo thêm
        </Button>
      )}
    </div>
  )
}
