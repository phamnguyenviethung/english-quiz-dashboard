import {
  IconArrowsSort,
  IconMessage2,
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
import {
  getEngLevelBadgeClass,
  getQuizTypeLabel,
} from "@/features/quiz/constants.ts"
import { formatDateTime } from "@/lib/format.ts"
import { cn } from "@/lib/utils"

import type { PoolReview, PoolReviewsSort } from "../types.ts"
import { ReviewStatusBadge, ReviewVerdictBadge } from "./review-badges.tsx"

const COLUMN_COUNT = 9

function IdSortHeader({
  sort,
  onSortChange,
}: {
  sort: PoolReviewsSort
  onSortChange: (sort: PoolReviewsSort) => void
}) {
  const isAsc = sort === "id_asc"
  const isDesc = sort === "id_desc"
  const Icon = isAsc
    ? IconSortAscending
    : isDesc
      ? IconSortDescending
      : IconArrowsSort

  return (
    <TableHead className="w-16">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 gap-1.5 font-medium"
        onClick={() => onSortChange(isDesc ? "id_asc" : "id_desc")}
      >
        ID
        <Icon
          stroke={1.5}
          className={cn("size-3.5", !isAsc && !isDesc && "opacity-50")}
        />
      </Button>
    </TableHead>
  )
}

export function PoolReviewsTable({
  items,
  sort,
  isPending,
  isRefetching,
  selectedId,
  onSortChange,
  onSelect,
}: {
  items: PoolReview[] | undefined
  sort: PoolReviewsSort
  isPending: boolean
  isRefetching: boolean
  selectedId: number | undefined
  onSortChange: (sort: PoolReviewsSort) => void
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
            <IdSortHeader sort={sort} onSortChange={onSortChange} />
            <TableHead className="w-20">Câu #</TableHead>
            <TableHead className="w-40">Loại</TableHead>
            <TableHead className="w-16">Cấp độ</TableHead>
            <TableHead>Chủ đề</TableHead>
            <TableHead className="w-24">Kết luận</TableHead>
            <TableHead className="w-28">Thay đổi</TableHead>
            <TableHead className="w-28">Trạng thái</TableHead>
            <TableHead className="w-32">Tạo lúc</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows columns={COLUMN_COUNT} />
          ) : (
            items?.map((item) => {
              const changed = item.changedFields?.length ?? 0
              return (
                <TableRow
                  key={item.id}
                  data-state={item.id === selectedId ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => onSelect(item.id)}
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    {item.id}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    #{item.poolQuestionRefId}
                  </TableCell>
                  <TableCell>{getQuizTypeLabel(item.quizType)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getEngLevelBadgeClass(item.engLevel)}
                    >
                      {item.engLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {item.topicName ?? "Không chủ đề"}
                      {item.adminNote ? (
                        <IconMessage2
                          stroke={1.5}
                          className="size-3.5 shrink-0 text-foreground/60"
                          title="Có ghi chú của admin"
                        />
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ReviewVerdictBadge verdict={item.verdict} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {item.status === "failed" ? (
                      <span className="text-muted-foreground">-</span>
                    ) : changed === 0 ? (
                      <span className="text-muted-foreground">Không đổi</span>
                    ) : (
                      `${changed} trường`
                    )}
                  </TableCell>
                  <TableCell>
                    <ReviewStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatDateTime(item.createdAt)}
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
