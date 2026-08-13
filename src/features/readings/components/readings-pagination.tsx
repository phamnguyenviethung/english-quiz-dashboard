import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatNumber } from "@/lib/format.ts"

import { PAGE_SIZE_OPTIONS } from "../constants.ts"

/** Cửa sổ trang quanh trang hiện tại; `null` là vị trí chèn dấu lược. */
function buildPageWindow(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_item, index) => index + 1)
  }

  const pages = new Set([1, totalPages, page, page - 1, page + 1])
  const visible = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b)

  const result: (number | null)[] = []
  let previous = 0
  for (const value of visible) {
    if (previous && value - previous > 1) result.push(null)
    result.push(value)
    previous = value
  }
  return result
}

export function ReadingsPagination({
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageSize: number
  totalPages: number
  total: number | undefined
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const isFirst = page <= 1
  const isLast = page >= totalPages

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger size="sm" aria-label="Số dòng mỗi trang">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} dòng
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-sm text-muted-foreground tabular-nums">
          Trang {formatNumber(page)} / {formatNumber(totalPages)}
          {total === undefined ? null : ` · ${formatNumber(total)} bài`}
        </p>
      </div>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text="Trước"
              aria-disabled={isFirst}
              className={
                isFirst ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
              onClick={() => {
                if (!isFirst) onPageChange(page - 1)
              }}
            />
          </PaginationItem>

          {buildPageWindow(page, totalPages).map((value, index) =>
            value === null ? (
              <PaginationItem key={`gap-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={value}>
                <PaginationLink
                  isActive={value === page}
                  className="cursor-pointer tabular-nums"
                  onClick={() => onPageChange(value)}
                >
                  {value}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              text="Sau"
              aria-disabled={isLast}
              className={
                isLast ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
              onClick={() => {
                if (!isLast) onPageChange(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
