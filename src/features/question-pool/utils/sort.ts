import type { SortingState } from "@tanstack/react-table"

import type { PoolQuestionsSort, PoolSortableColumn } from "../types.ts"

export const DEFAULT_POOL_SORT: PoolQuestionsSort = "id_asc"

export const POOL_SORTS: PoolQuestionsSort[] = [
  "id_asc",
  "id_desc",
  "created_asc",
  "created_desc",
  "token_asc",
  "token_desc",
]

// Column id ở table ↔ tiền tố của param `sort` mà API nhận. Kiểu index có `undefined`
// vì cả hai chiều đều tra bằng string tự do (id cột từ table, param từ URL);
// `satisfies` vẫn bắt lỗi nếu thiếu cột sortable nào.
const COLUMN_TO_SORT_KEY: Record<string, string | undefined> = {
  id: "id",
  token: "token",
  createdAt: "created",
} satisfies Record<PoolSortableColumn, string>

const SORT_KEY_TO_COLUMN: Record<string, PoolSortableColumn | undefined> = {
  id: "id",
  token: "token",
  created: "createdAt",
}

export function sortToSortingState(sort: PoolQuestionsSort): SortingState {
  const [key, direction] = sort.split("_")
  const column = SORT_KEY_TO_COLUMN[key]
  if (!column) return []
  return [{ id: column, desc: direction === "desc" }]
}

/** Table cho phép bỏ sort (mảng rỗng) — API thì luôn cần một giá trị, nên fallback default. */
export function sortingStateToSort(sorting: SortingState): PoolQuestionsSort {
  if (sorting.length === 0) return DEFAULT_POOL_SORT

  const entry = sorting[0]
  const key = COLUMN_TO_SORT_KEY[entry.id]
  if (!key) return DEFAULT_POOL_SORT

  return `${key}_${entry.desc ? "desc" : "asc"}` as PoolQuestionsSort
}
