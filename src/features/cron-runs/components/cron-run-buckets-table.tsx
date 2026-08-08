import { CollapsibleJson } from "@/components/common/json-block.tsx"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getQuizTypeLabel } from "@/features/quiz/constants.ts"
import { formatNumber, formatUsd } from "@/lib/format.ts"

import { getCronStatusMeta } from "../constants.ts"
import type { CronRunAttempt, CronRunBucket } from "../types.ts"

export function CronRunBucketsTable({
  buckets,
  attemptsByBucket,
}: {
  buckets: CronRunBucket[]
  attemptsByBucket: Map<number, CronRunAttempt[]>
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Bucket</TableHead>
            <TableHead className="text-right">Câu hỏi</TableHead>
            <TableHead className="text-right">Lượt thử</TableHead>
            <TableHead className="text-right">Chi phí</TableHead>
            <TableHead>Lỗi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buckets.map((bucket) => {
            const status = getCronStatusMeta(bucket.status)
            const attempts = attemptsByBucket.get(bucket.id) ?? []

            return (
              <TableRow key={bucket.id}>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>
                  <p className="font-medium">
                    {bucket.engLevel} · {getQuizTypeLabel(bucket.quizType)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bucket.topicName ?? "Không chủ đề"}
                  </p>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(bucket.insertedCount)}/
                  {formatNumber(bucket.requestedCount)}
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(bucket.generatedCount)} sinh ra
                  </p>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(attempts.length)}
                </TableCell>
                <TableCell
                  className="text-right tabular-nums"
                  title={
                    bucket.costUsd === null
                      ? "Model chưa có giá nên không tính được chi phí"
                      : undefined
                  }
                >
                  {formatUsd(bucket.costUsd)}
                </TableCell>
                <TableCell className="max-w-72">
                  {bucket.errorMessage ? (
                    <>
                      <p className="line-clamp-1 text-xs text-destructive">
                        {bucket.errorPhase ? `[${bucket.errorPhase}] ` : ""}
                        {bucket.errorMessage}
                      </p>
                      <CollapsibleJson
                        label="Chi tiết"
                        value={bucket.errorStack ?? bucket.errorMessage}
                        className="mt-1"
                      />
                    </>
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
