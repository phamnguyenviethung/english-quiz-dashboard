import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

export function TableSkeletonRows({
  rows = 5,
  columns,
}: {
  rows?: number
  columns: number
}) {
  return Array.from({ length: rows }, (_row, rowIndex) => (
    <TableRow key={rowIndex}>
      {Array.from({ length: columns }, (_cell, cellIndex) => (
        <TableCell key={cellIndex}>
          <Skeleton className="h-4 w-full max-w-24" />
        </TableCell>
      ))}
    </TableRow>
  ))
}
