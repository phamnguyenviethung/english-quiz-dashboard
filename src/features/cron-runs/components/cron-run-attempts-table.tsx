import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNumber, formatUsd } from "@/lib/format.ts"

import { getCronStatusMeta } from "../constants.ts"
import type { CronRunAttempt } from "../types.ts"

export function CronRunAttemptsTable({
  attempts,
}: {
  attempts: CronRunAttempt[]
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Lần</TableHead>
            <TableHead className="text-right">Sinh ra</TableHead>
            <TableHead className="text-right">Token</TableHead>
            <TableHead className="text-right">Chi phí</TableHead>
            <TableHead>Lỗi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.map((attempt) => {
            const status = getCronStatusMeta(attempt.status)

            return (
              <TableRow key={attempt.id}>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {attempt.model}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {attempt.attemptOrder}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(attempt.generatedCount)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(attempt.tokenIn + attempt.tokenOut)}
                </TableCell>
                <TableCell
                  className="text-right tabular-nums"
                  title={
                    attempt.costUsd === null
                      ? "Model chưa có giá nên không tính được chi phí"
                      : undefined
                  }
                >
                  {formatUsd(attempt.costUsd)}
                </TableCell>
                <TableCell className="max-w-64">
                  {attempt.errorMessage ? (
                    <p className="line-clamp-2 text-xs text-destructive">
                      {attempt.errorMessage}
                    </p>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
