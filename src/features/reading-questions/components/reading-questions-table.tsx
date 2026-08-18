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
import { getEngLevelBadgeClass } from "@/features/quiz/constants.ts"
import { cn } from "@/lib/utils"

import type {
  ReadingQuestion,
  ReadingQuestionSortableColumn,
  ReadingQuestionsSort,
} from "../types.ts"
import { ReadingQuestionTypeBadge } from "./reading-question-body.tsx"

const COLUMN_COUNT = 7

const SORT_PAIRS: Record<
  ReadingQuestionSortableColumn,
  { asc: ReadingQuestionsSort; desc: ReadingQuestionsSort }
> = {
  id: { asc: "id_asc", desc: "id_desc" },
  passage: { asc: "passage_asc", desc: "passage_desc" },
  createdAt: { asc: "created_asc", desc: "created_desc" },
}

function SortHeader({
  column,
  label,
  sort,
  onSortChange,
  className,
}: {
  column: ReadingQuestionSortableColumn
  label: string
  sort: ReadingQuestionsSort
  onSortChange: (sort: ReadingQuestionsSort) => void
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

export function ReadingQuestionsTable({
  items,
  sort,
  isPending,
  isRefetching,
  selectedId,
  onSortChange,
  onSelect,
}: {
  items: ReadingQuestion[] | undefined
  sort: ReadingQuestionsSort
  isPending: boolean
  isRefetching: boolean
  selectedId: number | undefined
  onSortChange: (sort: ReadingQuestionsSort) => void
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
            <TableHead>Câu hỏi</TableHead>
            <TableHead className="w-44">Loại</TableHead>
            <TableHead className="w-20">Cấp độ</TableHead>
            <SortHeader
              column="passage"
              label="Bài đọc"
              sort={sort}
              onSortChange={onSortChange}
              className="w-24"
            />
            <TableHead>Model</TableHead>
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
                <TableCell className="max-w-96 truncate font-medium">
                  {item.question}
                </TableCell>
                <TableCell>
                  <ReadingQuestionTypeBadge quizType={item.quizType} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getEngLevelBadgeClass(item.cefrLevel)}
                  >
                    {item.cefrLevel}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  #{item.passageRefId}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {item.model}
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
