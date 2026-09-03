import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
} from "@tabler/icons-react"

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
  formatModelName,
  getEngLevelBadgeClass,
} from "@/features/quiz/constants.ts"
import { formatDateTime } from "@/lib/format.ts"
import { cn } from "@/lib/utils"

import { getReadingTypeLabel } from "../constants.ts"
import type {
  ReadingPassage,
  ReadingPassagesSort,
  ReadingSortableColumn,
} from "../types.ts"
import { WordCountBadge } from "./word-count-badge.tsx"

const COLUMN_COUNT = 9

const SORT_PAIRS: Record<
  ReadingSortableColumn,
  { asc: ReadingPassagesSort; desc: ReadingPassagesSort }
> = {
  id: { asc: "id_asc", desc: "id_desc" },
  wordCount: { asc: "words_asc", desc: "words_desc" },
  createdAt: { asc: "created_asc", desc: "created_desc" },
}

function SortHeader({
  column,
  label,
  sort,
  onSortChange,
  className,
}: {
  column: ReadingSortableColumn
  label: string
  sort: ReadingPassagesSort
  onSortChange: (sort: ReadingPassagesSort) => void
  className?: string
}) {
  const pair = SORT_PAIRS[column]
  const isAsc = sort === pair.asc
  const isDesc = sort === pair.desc
  const SortIcon = isAsc
    ? IconArrowUp
    : isDesc
      ? IconArrowDown
      : IconArrowsSort

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSortChange(isDesc ? pair.asc : pair.desc)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          (isAsc || isDesc) && "text-foreground"
        )}
      >
        <span>{label}</span>
        <SortIcon
          className={cn("size-3.5", !isAsc && !isDesc && "opacity-40")}
          stroke={1.5}
        />
      </button>
    </TableHead>
  )
}

export function ReadingsTable({
  items,
  sort,
  isPending,
  isRefetching,
  selectedId,
  onSortChange,
  onSelect,
}: {
  items: ReadingPassage[] | undefined
  sort: ReadingPassagesSort
  isPending: boolean
  isRefetching: boolean
  selectedId: number | undefined
  onSortChange: (sort: ReadingPassagesSort) => void
  onSelect: (id: number) => void
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border min-w-0 w-full">
      <Table
        className={cn(
          "transition-opacity",
          isRefetching && !isPending && "opacity-60"
        )}
        aria-busy={isRefetching || isPending}
      >
        <TableHeader>
          <TableRow>
            <SortHeader
              column="id"
              label="ID"
              sort={sort}
              onSortChange={onSortChange}
              className="w-16"
            />
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Chủ đề</TableHead>
            <TableHead className="w-20">Cấp độ</TableHead>
            <TableHead className="w-28">Loại</TableHead>
            <SortHeader
              column="wordCount"
              label="Độ dài"
              sort={sort}
              onSortChange={onSortChange}
              className="w-28"
            />
            <TableHead>Model</TableHead>
            <SortHeader
              column="createdAt"
              label="Tạo lúc"
              sort={sort}
              onSortChange={onSortChange}
              className="w-40"
            />
            <TableHead className="w-28">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows columns={COLUMN_COUNT} />
          ) : (
            items?.map((item) => {
              const model = formatModelName(item.model)

              return (
                <TableRow
                  key={item.id}
                  data-state={item.id === selectedId ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => onSelect(item.id)}
                >
                  <TableCell className="text-muted-foreground tabular-nums font-mono text-xs">
                    {item.id}
                  </TableCell>
                  <TableCell
                    className="max-w-80 truncate font-medium"
                    title={item.title}
                  >
                    {item.title}
                  </TableCell>
                  <TableCell
                    className="max-w-[20ch] truncate text-muted-foreground"
                    title={item.topicName ?? undefined}
                  >
                    {item.topicName ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getEngLevelBadgeClass(item.cefrLevel)}
                    >
                      {item.cefrLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getReadingTypeLabel(item.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <WordCountBadge wordCount={item.wordCount} />
                  </TableCell>
                  <TableCell
                    className="text-xs text-muted-foreground"
                    title={item.model}
                  >
                    {model.provider ? (
                      <span className="text-muted-foreground/70">
                        {model.provider}/
                      </span>
                    ) : null}
                    <span className="font-medium text-foreground">
                      {model.name}
                    </span>
                    {model.suffix ? (
                      <span className="text-muted-foreground/70">
                        :{model.suffix}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {formatDateTime(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    {item.isActive ? (
                      <Badge variant="secondary">Đang bật</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        Đã tắt
                      </Badge>
                    )}
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
