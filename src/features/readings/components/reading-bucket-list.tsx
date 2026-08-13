import { useMemo } from "react"
import { IconAlertTriangle, IconSearchOff } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
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
import { cn } from "@/lib/utils"

import type { ReadingBucket, ReadingBucketSummary } from "../types.ts"

interface TopicGroup {
  topicId: number | null
  topicName: string
  buckets: ReadingBucket[]
  plannedPassages: number
}

function groupByTopic(buckets: ReadingBucket[]): TopicGroup[] {
  const groups = new Map<string, TopicGroup>()

  for (const bucket of buckets) {
    const key = String(bucket.topicId ?? "null")
    const group = groups.get(key) ?? {
      topicId: bucket.topicId,
      topicName: bucket.topicName ?? "Không có chủ đề",
      buckets: [],
      plannedPassages: 0,
    }
    group.buckets.push(bucket)
    group.plannedPassages += bucket.plannedCount
    groups.set(key, group)
  }

  return [...groups.values()].sort((a, b) =>
    a.topicName.localeCompare(b.topicName)
  )
}

/**
 * Bucket reading chỉ 2 chiều nên mỗi topic gọn trong 4 ô level — bày phẳng theo topic
 * thay vì accordion như bên pool (pool có thêm chiều quizType nên mới cần gấp lại).
 */
export function ReadingBucketList({
  buckets,
  summary,
  selectedKeys,
  isPending,
  isStale,
  isError,
  error,
  onRetry,
  onToggleBuckets,
  onToggleAll,
}: {
  buckets: ReadingBucket[]
  summary: ReadingBucketSummary
  selectedKeys: Set<string>
  isPending: boolean
  isStale: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onToggleBuckets: (bucketKeys: string[], checked: boolean) => void
  onToggleAll: (checked: boolean) => void
}) {
  const groups = useMemo(() => groupByTopic(buckets), [buckets])

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
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_item, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (buckets.length === 0) {
    return (
      <Empty className="rounded-2xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconSearchOff stroke={1.5} />
          </EmptyMedia>
          <EmptyTitle>Không có bucket nào khớp</EmptyTitle>
          <EmptyDescription>
            Thử bỏ bớt điều kiện lọc, hoặc kiểm tra xem đã có chủ đề nào đang
            bật chưa.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const selectableKeys = buckets
    .filter((bucket) => bucket.plannedCount > 0)
    .map((bucket) => bucket.bucketKey)
  const allSelected =
    selectableKeys.length > 0 &&
    selectableKeys.every((key) => selectedKeys.has(key))

  return (
    <div className={cn("space-y-3", isStale && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleAll(!allSelected)}
        >
          {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </Button>
        <p className="text-sm text-muted-foreground tabular-nums">
          {summary.matchedBuckets} bucket khớp · tối đa {summary.maxPerBucket}{" "}
          bài/bucket
        </p>
      </div>

      {groups.map((group) => (
        <div
          key={String(group.topicId ?? "null")}
          className="rounded-2xl border p-4"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-medium">{group.topicName}</span>
            <Badge variant="secondary" className="tabular-nums">
              +{group.plannedPassages} bài
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => {
                const keys = group.buckets
                  .filter((bucket) => bucket.plannedCount > 0)
                  .map((bucket) => bucket.bucketKey)
                const isAllOn = keys.every((key) => selectedKeys.has(key))
                onToggleBuckets(keys, !isAllOn)
              }}
            >
              Đảo chọn
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {group.buckets.map((bucket) => {
              const id = `bucket-${bucket.bucketKey}`
              const isSkipped = bucket.plannedCount === 0
              return (
                <Label
                  key={bucket.bucketKey}
                  htmlFor={id}
                  className={cn(
                    "flex min-h-11 items-start gap-2.5 rounded-xl border p-2.5 font-normal",
                    isSkipped && "opacity-60"
                  )}
                >
                  <Checkbox
                    id={id}
                    className="mt-0.5"
                    checked={selectedKeys.has(bucket.bucketKey)}
                    disabled={isSkipped}
                    onCheckedChange={(checked) =>
                      onToggleBuckets([bucket.bucketKey], checked)
                    }
                  />
                  <div className="grid gap-0.5">
                    <span className="text-sm font-medium">
                      {bucket.cefrLevel}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      đang có {bucket.currentCount}
                      {isSkipped
                        ? " · đã đủ, bỏ qua"
                        : ` · +${bucket.plannedCount}`}
                    </span>
                  </div>
                </Label>
              )
            })}
          </div>
        </div>
      ))}

      {summary.plannedBuckets === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconAlertTriangle stroke={1.5} className="size-4" />
          Mọi bucket khớp bộ lọc đều đã đủ bài. Đổi phạm vi sang "Toàn bộ
          bucket" nếu vẫn muốn sinh thêm.
        </p>
      ) : null}
    </div>
  )
}
