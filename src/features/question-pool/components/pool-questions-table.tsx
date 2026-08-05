import { IconArrowDown, IconArrowUp, IconArrowsSort } from "@tabler/icons-react"

import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import type { PoolTable } from "../hooks/use-pool-table.ts"

export function PoolQuestionsTable({
  table,
  isPending,
  isRefetching,
  selectedQuestionId,
  onSelect,
}: {
  table: PoolTable
  isPending: boolean
  isRefetching: boolean
  selectedQuestionId: number | undefined
  onSelect: (questionId: number) => void
}) {
  const visibleColumnCount = table.getVisibleLeafColumns().length

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table
        // Khi refetch (đổi trang/filter) vẫn giữ trang cũ nhờ keepPreviousData —
        // làm mờ thay vì đổi sang skeleton để layout không giật.
        className={cn(
          "transition-opacity",
          isRefetching && !isPending && "opacity-60"
        )}
        aria-busy={isRefetching || isPending}
      >
        {/* Không sticky: toolbar đã dính ở top-16, header bảng dính nữa sẽ phải
            biết chiều cao toolbar lúc runtime (toolbar wrap 1 hay 2 hàng tuỳ viewport). */}
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta
                const sortDirection = header.column.getIsSorted()
                const SortIcon =
                  sortDirection === "asc"
                    ? IconArrowUp
                    : sortDirection === "desc"
                      ? IconArrowDown
                      : IconArrowsSort

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      meta?.align === "right" && "text-right",
                      meta?.headClassName
                    )}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "inline-flex items-center gap-1 hover:text-foreground",
                          sortDirection && "text-foreground"
                        )}
                      >
                        <table.FlexRender header={header} />
                        <SortIcon
                          className={cn(
                            "size-3.5",
                            !sortDirection && "opacity-40"
                          )}
                          stroke={1.5}
                        />
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {isPending ? (
            <TableSkeletonRows columns={visibleColumnCount} />
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onSelect(row.original.id)}
                data-state={
                  selectedQuestionId === row.original.id
                    ? "selected"
                    : undefined
                }
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.columnDef.meta?.align === "right" &&
                        "text-right"
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
