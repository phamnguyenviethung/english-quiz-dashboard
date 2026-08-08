import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

const COLUMN_COUNT = 8

export function CronRunsTable({
  runs,
  isPending,
  selectedRunId,
  onSelect,
}: {
  runs: CronRun[]
  isPending: boolean
  selectedRunId: string | undefined
  onSelect: (runId: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Job</TableHead>
            <TableHead className="text-right">Buckets</TableHead>
            <TableHead className="text-right">Câu hỏi</TableHead>
            <TableHead className="text-right">Token</TableHead>
            <TableHead className="text-right">Chi phí</TableHead>
            <TableHead className="text-right">Thời lượng</TableHead>
            <TableHead>Bắt đầu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows columns={COLUMN_COUNT} />
          ) : (
            runs.map((run) => {
              const status = getCronStatusMeta(run.status)
              const StatusIcon = status.icon

              return (
                <TableRow
                  key={run.runId}
                  onClick={() => onSelect(run.runId)}
                  data-state={
                    selectedRunId === run.runId ? "selected" : undefined
                  }
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Badge variant={status.variant}>
                      {StatusIcon ? (
                        <StatusIcon className="size-3.5" stroke={1.5} />
                      ) : null}
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {labelFor(CRON_JOB_LABELS, run.jobKey)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {labelFor(CRON_TRIGGER_LABELS, run.trigger)}
                    </p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(run.succeededBuckets)}/
                    {formatNumber(run.totalBuckets)}
                    {run.failedBuckets > 0 ? (
                      <span className="ml-1 text-destructive">
                        ({formatNumber(run.failedBuckets)} lỗi)
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(run.insertedQuestions)}/
                    {formatNumber(run.requestedQuestions)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(run.tokenIn + run.tokenOut)}
                  </TableCell>
                  <TableCell
                    className="text-right tabular-nums"
                    title={
                      run.costUsd === null
                        ? "Model chưa có giá nên không tính được chi phí"
                        : undefined
                    }
                  >
                    {formatUsd(run.costUsd)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDuration(run.durationMs)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {formatDateTime(run.startedAt)}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
