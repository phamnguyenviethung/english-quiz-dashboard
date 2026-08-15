import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

export function TableSkeletonRows({
  rows = 5,
  columns,
  rowClassName,
  columnClassNames,
}: {
  rows?: number
  columns: number
  /** Cần nền đặc nếu bảng có cột ghim (xem sticky-table.tsx). */
  rowClassName?: string
  /** Class theo từng cột, để hàng chờ khớp với cột ẩn/ghim của bảng thật. */
  columnClassNames?: (string | undefined)[]
}) {
  return Array.from({ length: rows }, (_row, rowIndex) => (
    <TableRow key={rowIndex} className={rowClassName}>
      {Array.from({ length: columns }, (_cell, cellIndex) => (
        <TableCell key={cellIndex} className={columnClassNames?.[cellIndex]}>
          <Skeleton className="h-4 w-full max-w-24" />
        </TableCell>
      ))}
    </TableRow>
  ))
}
