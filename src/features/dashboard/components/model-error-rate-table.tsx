import { IconChartBar } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNumber, formatPercent } from "@/lib/format.ts"

import type { DashboardModelRow } from "../hooks/use-dashboard-usage.ts"

export function ModelErrorRateTable({
  rows,
  isPending,
  isError,
  error,
  onRetry,
}: {
  rows: DashboardModelRow[]
  isPending: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
}) {
  if (isError) {
    return (
      <QueryError
        title="Không tải được tỷ lệ lỗi theo model"
        error={error}
        onRetry={onRetry}
      />
    )
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <Empty className="rounded-2xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconChartBar stroke={1.5} />
          </EmptyMedia>
          <EmptyTitle>Chưa có lượt gọi model nào</EmptyTitle>
          <EmptyDescription>
            Không có lượt gọi AI nào trong 30 ngày gần đây.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Lượt gọi</TableHead>
            <TableHead className="text-right">Thành công</TableHead>
            <TableHead className="text-right">Thất bại</TableHead>
            <TableHead className="text-right">Tỷ lệ lỗi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.model}>
              <TableCell className="font-mono text-xs">{row.model}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(row.requestCount)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(row.successCount)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(row.failedCount)}
              </TableCell>
              <TableCell className="text-right">
                {row.errorRate > 0 ? (
                  <Badge variant="destructive">
                    {formatPercent(row.errorRate)}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground tabular-nums">
                    {formatPercent(row.errorRate)}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
