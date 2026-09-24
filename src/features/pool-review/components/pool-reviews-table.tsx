import {
  IconArrowsSort,
  IconMessage2,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react"

import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import { Badge } from "@/components/ui/badge"
import { BeginnerBadge } from "@/features/beginner/components/beginner-badge.tsx"
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

const COLUMN_COUNT = 6

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
    <TableHead className="w-28">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 gap-1.5 font-medium"
        onClick={() => onSortChange(isDesc ? "id_asc" : "id_desc")}
      >
        Câu #
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
  onSortChange,
  onSelect,
}: {
  items: PoolReview[] | undefined
  sort: PoolReviewsSort
  isPending: boolean
  isRefetching: boolean
  onSortChange: (sort: PoolReviewsSort) => void
  onSelect: (id: number) => void
}) {
  return (
    <div
      className={cn(
        "hidden overflow-x-auto rounded-2xl border transition-opacity md:block",
        isRefetching && "opacity-60"
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <IdSortHeader sort={sort} onSortChange={onSortChange} />
            <TableHead>Loại · cấp độ</TableHead>
            <TableHead>Chủ đề</TableHead>
            <TableHead className="w-24">Kết luận</TableHead>
            <TableHead className="w-28">Thay đổi</TableHead>
            <TableHead className="w-32">Trạng thái</TableHead>
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
                  className="cursor-pointer"
                  onClick={() => onSelect(item.id)}
                >
                  <TableCell className="tabular-nums">
                    <span className="font-medium">
                      #{item.poolQuestionRefId}
                    </span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      r{item.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      {getQuizTypeLabel(item.quizType)}
                      <Badge
                        variant="outline"
                        className={getEngLevelBadgeClass(item.engLevel)}
                      >
                        {item.engLevel}
                      </Badge>
                      {item.forBeginner ? <BeginnerBadge label="Mới" /> : null}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {item.topicName ?? "Không chủ đề"}
                      {item.adminNote ? (
                        <IconMessage2
                          stroke={1.5}
                          className="size-3.5 shrink-0 text-foreground/60"
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
                    <div className="flex flex-col gap-0.5">
                      <ReviewStatusBadge status={item.status} />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
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
