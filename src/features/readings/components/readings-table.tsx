import {
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react"

import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  const Icon = isAsc
    ? IconSortAscending
    : isDesc
      ? IconSortDescending
      : IconArrowsSort

  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 gap-1.5 font-medium"
        onClick={() => onSortChange(isDesc ? pair.asc : pair.desc)}
      >
        {label}
        <Icon
          stroke={1.5}
          className={cn("size-3.5", !isAsc && !isDesc && "opacity-50")}
        />
      </Button>
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
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border transition-opacity",
        isRefetching && "opacity-60"
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <SortHeader
              column="id"
              label="ID"
              sort={sort}
              onSortChange={onSortChange}
              className="w-20"
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
            <TableHead className="w-24">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows columns={COLUMN_COUNT} />
          ) : (
            items?.map((item) => (
              <TableRow
                key={item.id}
                data-state={item.id === selectedId ? "selected" : undefined}
                className="cursor-pointer"
                onClick={() => onSelect(item.id)}
              >
                <TableCell className="text-muted-foreground tabular-nums">
                  {item.id}
                </TableCell>
                <TableCell className="max-w-80 truncate font-medium">
                  {item.title}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.topicName ?? "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.cefrLevel}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getReadingTypeLabel(item.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <WordCountBadge wordCount={item.wordCount} />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {item.model}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {formatDateTime(item.createdAt)}
                </TableCell>
                <TableCell>
                  {item.isActive ? (
                    <Badge variant="secondary">Đang bật</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Đã tắt
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
