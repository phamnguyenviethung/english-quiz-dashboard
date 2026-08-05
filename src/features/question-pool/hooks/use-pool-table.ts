import { functionalUpdate, useTable } from "@tanstack/react-table"
import type { ColumnVisibilityState, SortingState } from "@tanstack/react-table"

import {
  poolColumns,
  poolTableFeatures,
} from "../components/pool-questions-columns.tsx"
import type { PoolQuestion } from "../types.ts"

// Fallback phải ổn định: mảng mới mỗi render sẽ invalidate row model của table.
const EMPTY_ROWS: PoolQuestion[] = []

export type PoolTable = ReturnType<
  typeof useTable<typeof poolTableFeatures, PoolQuestion>
>

/**
 * Table instance dùng chung giữa toolbar (menu ẩn/hiện cột) và bảng.
 * Sort + phân trang do server làm, table chỉ giữ state để render header và cột.
 */
export function usePoolTable({
  questions,
  sorting,
  columnVisibility,
  onSortingChange,
  onColumnVisibilityChange,
}: {
  questions: PoolQuestion[] | undefined
  sorting: SortingState
  columnVisibility: ColumnVisibilityState
  onSortingChange: (sorting: SortingState) => void
  onColumnVisibilityChange: (visibility: ColumnVisibilityState) => void
}): PoolTable {
  return useTable({
    features: poolTableFeatures,
    columns: poolColumns,
    data: questions ?? EMPTY_ROWS,
    manualSorting: true,
    state: { sorting, columnVisibility },
    onSortingChange: (updater) =>
      onSortingChange(functionalUpdate(updater, sorting)),
    onColumnVisibilityChange: (updater) =>
      onColumnVisibilityChange(functionalUpdate(updater, columnVisibility)),
  })
}
