import { IconFilterOff } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/common/query-error.tsx"
import {
  ENG_LEVEL_BADGE_CLASS,
  getQuizTypeLabel,
} from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"
import { formatNumber } from "@/lib/format.ts"
import { cn } from "@/lib/utils"

import { NO_TOPIC_LABEL } from "../constants.ts"
import type { PoolBucket, PoolBucketSummary } from "../types.ts"

export function RefillBucketPreview({
  buckets,
  summary,
  selectedKeys,
  isPending,
  isStale,
  isError,
  error,
  onRetry,
  onToggle,
  onToggleAll,
}: {
  buckets: PoolBucket[]
  summary: PoolBucketSummary
  selectedKeys: Set<string>
  isPending: boolean
  isStale: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onToggle: (bucketKey: string, checked: boolean) => void
  onToggleAll: (checked: boolean) => void
}) {
  if (isError) {
    return (
      <QueryError
        title="Không tải được danh sách bucket"
        error={error}
        onRetry={onRetry}
      />
    )
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-56" />
        <div className="flex flex-col gap-2 rounded-2xl border p-3">
          {Array.from({ length: 6 }, (_item, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (buckets.length === 0) {
    return (
      <Empty className="rounded-2xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconFilterOff stroke={1.5} />
          </EmptyMedia>
          <EmptyTitle>Không có bucket nào khớp</EmptyTitle>
          <EmptyDescription>
            Nới bộ lọc cấp độ, chủ đề hoặc loại quiz để chọn được bucket.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  // Bucket plannedCount = 0 đã đủ câu và bị scope hiện tại bỏ qua — hiện ra để nói rõ
  // lý do, nhưng không cho tick vì có tick cũng không sinh câu nào.
  const selectableKeys = buckets
    .filter((bucket) => bucket.plannedCount > 0)
    .map((bucket) => bucket.bucketKey)
  const selectedCount = selectableKeys.filter((key) =>
    selectedKeys.has(key)
  ).length
  const allSelected =
    selectableKeys.length > 0 && selectedCount === selectableKeys.length

  const plannedQuestions = buckets
    .filter((bucket) => selectedKeys.has(bucket.bucketKey))
    .reduce((sum, bucket) => sum + bucket.plannedCount, 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className={cn(
            "text-sm tabular-nums",
            isStale && "text-muted-foreground"
          )}
        >
          <span className="font-medium">{formatNumber(selectedCount)}</span>{" "}
          bucket đã chọn ·{" "}
          <span className="font-medium">{formatNumber(plannedQuestions)}</span>{" "}
          câu sẽ sinh
          {summary.matchedBuckets > selectableKeys.length ? (
            <span className="text-muted-foreground">
              {" "}
              · {formatNumber(summary.matchedBuckets - selectableKeys.length)}{" "}
              bucket đã đủ câu
            </span>
          ) : null}
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={selectableKeys.length === 0}
          onClick={() => onToggleAll(!allSelected)}
        >
          {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </Button>
      </div>

      <div className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-2xl border p-2">
        {buckets.map((bucket) => {
          const isSkipped = bucket.plannedCount === 0
          const id = `refill-bucket-${bucket.bucketKey}`

          return (
            <Label
              key={bucket.bucketKey}
              htmlFor={id}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2 py-1.5 font-normal",
                isSkipped ? "opacity-60" : "hover:bg-muted/60"
              )}
            >
              <Checkbox
                id={id}
                checked={!isSkipped && selectedKeys.has(bucket.bucketKey)}
                disabled={isSkipped}
                onCheckedChange={(checked) =>
                  onToggle(bucket.bucketKey, checked)
                }
              />
              <Badge
                variant="secondary"
                className={ENG_LEVEL_BADGE_CLASS[bucket.engLevel as EngLevel]}
              >
                {bucket.engLevel}
              </Badge>
              <span className="min-w-0 flex-1 truncate text-sm">
                {bucket.topicName ?? NO_TOPIC_LABEL}
                <span className="text-muted-foreground">
                  {" · "}
                  {getQuizTypeLabel(bucket.quizType)}
                </span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {isSkipped
                  ? "đã đủ"
                  : `${formatNumber(bucket.currentCount)}/${formatNumber(summary.maxPerBucket)} · +${formatNumber(bucket.plannedCount)}`}
              </span>
            </Label>
          )
        })}
      </div>
    </div>
  )
}
