import {
  IconAlertTriangle,
  IconClock,
  IconCoins,
  IconCurrencyDollar,
  IconDatabase,
  IconStack2,
} from "@tabler/icons-react"

import { CollapsibleJson } from "@/components/common/json-block.tsx"
import { StatTile, StatTileGrid } from "@/components/common/stat-tile.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  formatDateTime,
  formatDuration,
  formatNumber,
  formatUsd,
} from "@/lib/format.ts"

import {
  CRON_JOB_LABELS,
  CRON_TRIGGER_LABELS,
  getCronStatusMeta,
  labelFor,
} from "../constants.ts"
import type { CronRun } from "../types.ts"

export function CronRunSummary({ run }: { run: CronRun }) {
  const status = getCronStatusMeta(run.status)
  const StatusIcon = status.icon

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={status.variant}>
          {StatusIcon ? <StatusIcon className="size-3.5" stroke={1.5} /> : null}
          {status.label}
        </Badge>
        <Badge variant="outline">{labelFor(CRON_JOB_LABELS, run.jobKey)}</Badge>
        <Badge variant="outline">
          {labelFor(CRON_TRIGGER_LABELS, run.trigger)}
        </Badge>
        <code className="font-mono text-xs text-muted-foreground">
          {run.runId}
        </code>
      </div>

      <StatTileGrid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile
          label="Buckets"
          value={`${formatNumber(run.succeededBuckets)}/${formatNumber(run.totalBuckets)}`}
          hint={`${formatNumber(run.deficientBuckets)} thiếu · ${formatNumber(run.skippedBuckets)} bỏ qua`}
          icon={IconStack2}
        />
        <StatTile
          label="Bucket lỗi"
          value={formatNumber(run.failedBuckets)}
          tone={run.failedBuckets > 0 ? "danger" : "default"}
          icon={IconAlertTriangle}
        />
        <StatTile
          label="Câu hỏi đã lưu"
          value={formatNumber(run.insertedQuestions)}
          hint={`${formatNumber(run.generatedQuestions)} sinh ra / ${formatNumber(run.requestedQuestions)} yêu cầu`}
          icon={IconDatabase}
        />
        <StatTile
          label="Token"
          value={formatNumber(run.tokenIn + run.tokenOut)}
          hint={`${formatNumber(run.tokenIn)} vào / ${formatNumber(run.tokenOut)} ra`}
          icon={IconCoins}
        />
        <StatTile
          label="Chi phí"
          value={formatUsd(run.costUsd)}
          hint={
            run.costUsd === null
              ? "Model chưa có giá cache"
              : "Tính từ token và giá model"
          }
          tone={run.costUsd === null ? "muted" : "default"}
          icon={IconCurrencyDollar}
        />
        <StatTile
          label="Thời lượng"
          value={formatDuration(run.durationMs)}
          hint={formatDateTime(run.startedAt)}
          icon={IconClock}
        />
        <StatTile
          label="Kết thúc"
          value={
            <span className="text-base">{formatDateTime(run.finishedAt)}</span>
          }
          hint={run.queueName ?? undefined}
        />
      </StatTileGrid>

      {run.errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>
            Lỗi{run.errorPhase ? ` ở bước ${run.errorPhase}` : ""}
          </AlertTitle>
          <AlertDescription>
            <p className="line-clamp-2">{run.errorMessage}</p>
            {run.errorStack ? (
              <CollapsibleJson
                label="Xem stack trace"
                value={run.errorStack}
                className="mt-2"
              />
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      {run.metadata ? (
        <CollapsibleJson label="Xem metadata" value={run.metadata} />
      ) : null}
    </div>
  )
}
