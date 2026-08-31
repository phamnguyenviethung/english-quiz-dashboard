import { IconMessage2 } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getEngLevelBadgeClass,
  getQuizTypeLabel,
} from "@/features/quiz/constants.ts"
import { formatDateTime } from "@/lib/format.ts"
import { cn } from "@/lib/utils"

import type { PoolReview } from "../types.ts"
import { ReviewStatusBadge, ReviewVerdictBadge } from "./review-badges.tsx"

export function PoolReviewCardList({
  items,
  isPending,
  isRefetching,
  onSelect,
}: {
  items: PoolReview[] | undefined
  isPending: boolean
  isRefetching: boolean
  onSelect: (id: number) => void
}) {
  if (isPending) {
    return (
      <div className="space-y-2 md:hidden">
        {Array.from({ length: 6 }, (_v, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <ul
      className={cn(
        "space-y-2 transition-opacity md:hidden",
        isRefetching && "opacity-60"
      )}
    >
      {items?.map((item) => {
        const changed = item.changedFields?.length ?? 0
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className="flex w-full flex-col gap-1.5 rounded-2xl border p-3 text-left active:bg-muted/60"
            >
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium tabular-nums">
                  Câu #{item.poolQuestionRefId}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm text-muted-foreground">
                  {getQuizTypeLabel(item.quizType)}
                </span>
                <Badge
                  variant="outline"
                  className={getEngLevelBadgeClass(item.engLevel)}
                >
                  {item.engLevel}
                </Badge>
                <ReviewVerdictBadge verdict={item.verdict} />
                <ReviewStatusBadge status={item.status} />
              </div>

              {item.summary ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {item.summary}
                </p>
              ) : null}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">
                  {item.topicName ?? "Không chủ đề"}
                </span>
                {item.adminNote ? (
                  <IconMessage2 stroke={1.5} className="size-3.5 shrink-0" />
                ) : null}
                <span className="ml-auto shrink-0 tabular-nums">
                  {item.status === "failed"
                    ? "—"
                    : changed === 0
                      ? "Không đổi"
                      : `${changed} trường đổi`}
                </span>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
