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
import { getReadingTypeLabel } from "@/features/readings/constants.ts"
import { cn } from "@/lib/utils"

import type {
  ReadingQuestion,
  ReadingQuestionSortableColumn,
  ReadingQuestionsSort,
} from "../types.ts"
import { ReadingQuestionTypeBadge } from "./reading-question-body.tsx"

const COLUMN_COUNT = 8

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
            <TableHead>Câu hỏi</TableHead>
            <TableHead className="w-44">Loại</TableHead>
            <TableHead className="w-20">Cấp độ</TableHead>
            <TableHead className="w-28">Loại bài</TableHead>
            <SortHeader
              column="passage"
              label="Bài đọc"
              sort={sort}
              onSortChange={onSortChange}
              className="w-24"
            />
            <TableHead>Model</TableHead>
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
                    className="max-w-96 truncate font-medium"
                    title={item.question}
                  >
                    {item.question}
                  </TableCell>
                  <TableCell>
                    <ReadingQuestionTypeBadge quizType={item.quizType} />
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
                  <TableCell className="text-muted-foreground tabular-nums">
                    #{item.passageRefId}
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
