import { useMemo, useState } from "react"
import {
  IconAlertTriangle,
  IconChevronRight,
  IconFilterOff,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { BeginnerBadge } from "@/features/beginner/components/beginner-badge.tsx"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
import { ENG_LEVEL_BADGE_CLASS } from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"
import { formatNumber } from "@/lib/format.ts"
import { cn } from "@/lib/utils"

import { NO_TOPIC_LABEL, TOUCH_ROW } from "../constants.ts"
import type {
  RefillBucketSummaryView,
  RefillBucketView,
  RefillCopy,
} from "../types.ts"
import { TriStateCheckbox } from "./tri-state-checkbox.tsx"

interface BucketGroup {
  key: string
  topicName: string
  buckets: RefillBucketView[]
  /** Bucket còn sinh được. Bucket đã đủ không tick được nên không tính vào đây. */
  selectableKeys: string[]
  selectedCount: number
  plannedItems: number
}

export function RefillBucketGroups({
  buckets,
  summary,
  copy,
  selectedKeys,
  isPending,
  isStale,
  isError,
  error,
  emptyDescription,
  onRetry,
  onToggleBuckets,
  onToggleAll,
}: {
  buckets: RefillBucketView[]
  summary: RefillBucketSummaryView
  copy: RefillCopy
  selectedKeys: Set<string>
  isPending: boolean
  isStale: boolean
  isError: boolean
  error: unknown
  emptyDescription: string
  onRetry: () => void
  onToggleBuckets: (bucketKeys: string[], checked: boolean) => void
  onToggleAll: (checked: boolean) => void
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())

  const groups = useMemo<BucketGroup[]>(() => {
    const byTopic = new Map<string, BucketGroup>()

    for (const bucket of buckets) {
      const key = String(bucket.topicId ?? "null")
      let group = byTopic.get(key)
      if (!group) {
        group = {
          key,
          topicName: bucket.topicName ?? NO_TOPIC_LABEL,
          buckets: [],
          selectableKeys: [],
          selectedCount: 0,
          plannedItems: 0,
        }
        byTopic.set(key, group)
      }

      group.buckets.push(bucket)
      if (bucket.plannedCount > 0) {
        group.selectableKeys.push(bucket.bucketKey)
        if (selectedKeys.has(bucket.bucketKey)) {
          group.selectedCount++
          group.plannedItems += bucket.plannedCount
        }
      }
    }

    // Chủ đề còn việc lên trước. Với scope='deficient' và kho gần đầy, phần lớn chủ đề
    // không sinh thêm gì; để nguyên thứ tự thì người dùng phải dò tìm vài chủ đề thật sự
    // có việc giữa hàng chục chủ đề đã đủ. Trong mỗi nhóm vẫn giữ thứ tự API trả về
    // (đã sắp theo deficiency).
    const all = [...byTopic.values()]
    return [
      ...all.filter((group) => group.selectableKeys.length > 0),
      ...all.filter((group) => group.selectableKeys.length === 0),
    ]
  }, [buckets, selectedKeys])

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
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-48" />
        <div className="flex flex-col gap-1 rounded-2xl border p-2">
          {Array.from({ length: 6 }, (_item, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <Empty className="rounded-2xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconFilterOff stroke={1.5} />
          </EmptyMedia>
          <EmptyTitle>Không có bucket nào khớp</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const allSelectableKeys = groups.flatMap((group) => group.selectableKeys)
  const selectedTotal = allSelectableKeys.filter((key) =>
    selectedKeys.has(key)
  ).length
  const isAllSelected =
    allSelectableKeys.length > 0 && selectedTotal === allSelectableKeys.length
  const skippedCount = summary.matchedBuckets - allSelectableKeys.length

  return (
    <div className={cn("flex flex-col gap-3", isStale && "opacity-70")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground tabular-nums">
          {formatNumber(groups.length)} chủ đề
          {skippedCount > 0
            ? `, ${formatNumber(skippedCount)} bucket đã đủ ${copy.unit}`
            : null}
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={allSelectableKeys.length === 0}
          onClick={() => onToggleAll(!isAllSelected)}
        >
          {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </Button>
      </div>

      {/* Mobile cuộn theo trang (không lồng scroll). Chỉ desktop mới cắt chiều cao
          vì cột tóm tắt bên phải đã sticky nên nút chạy vẫn luôn thấy. */}
      <div className="flex flex-col rounded-2xl border p-1.5 lg:max-h-128 lg:overflow-y-auto lg:overscroll-contain">
        {groups.map((group) => {
          const isOpen = openGroups.has(group.key)
          const isGroupSelected =
            group.selectableKeys.length > 0 &&
            group.selectedCount === group.selectableKeys.length
          const isPartial =
            group.selectedCount > 0 &&
            group.selectedCount < group.selectableKeys.length

          return (
            <Collapsible
              key={group.key}
              open={isOpen}
              onOpenChange={(open) =>
                setOpenGroups((current) => {
                  const next = new Set(current)
                  if (open) next.add(group.key)
                  else next.delete(group.key)
                  return next
                })
              }
            >
              <div
                className={cn(
                  "flex items-center gap-3 pl-2",
                  TOUCH_ROW,
                  group.selectableKeys.length === 0 && "opacity-60"
                )}
              >
                <TriStateCheckbox
                  aria-label={`Chọn toàn bộ bucket của ${group.topicName}`}
                  checked={isGroupSelected}
                  indeterminate={isPartial}
                  disabled={group.selectableKeys.length === 0}
                  onCheckedChange={(checked) =>
                    onToggleBuckets(group.selectableKeys, checked)
                  }
                />
                <CollapsibleTrigger
                  render={
                    <button
                      type="button"
                      className={cn(
                        "flex flex-1 items-center gap-3 rounded-xl pr-2 text-left transition-colors hover:bg-muted/60 active:bg-muted",
                        TOUCH_ROW
                      )}
                    />
                  }
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {group.topicName}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {group.selectableKeys.length === 0
                      ? `đã đủ ${copy.unit}`
                      : `${
                          group.selectedCount === group.selectableKeys.length
                            ? formatNumber(group.selectableKeys.length)
                            : `${formatNumber(group.selectedCount)}/${formatNumber(group.selectableKeys.length)}`
                        } bucket · +${formatNumber(group.plannedItems)} ${copy.unit}`}
                  </span>
                  <IconChevronRight
                    stroke={1.5}
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
                      isOpen && "rotate-90"
                    )}
                  />
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="flex flex-col gap-0.5 pt-0.5 pb-2 pl-9">
                  {group.buckets.map((bucket) => {
                    const isSkipped = bucket.plannedCount === 0
                    const id = `bucket-${bucket.bucketKey}`

                    return (
                      <Label
                        key={bucket.bucketKey}
                        htmlFor={id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl pr-2 font-normal",
                          TOUCH_ROW,
                          isSkipped ? "opacity-60" : "hover:bg-muted/60"
                        )}
                      >
                        <Checkbox
                          id={id}
                          checked={
                            !isSkipped && selectedKeys.has(bucket.bucketKey)
                          }
                          disabled={isSkipped}
                          onCheckedChange={(checked) =>
                            onToggleBuckets([bucket.bucketKey], checked)
                          }
                        />
                        <Badge
                          variant="secondary"
                          className={
                            ENG_LEVEL_BADGE_CLASS[bucket.level as EngLevel]
                          }
                        >
                          {bucket.level}
                        </Badge>
                        {bucket.forBeginner ? (
                          <BeginnerBadge label="Mới" />
                        ) : null}
                        {/* Reading chỉ có 1 chiều nên không có nhãn phụ; vẫn giữ ô rỗng
                            để cột số bên phải thẳng hàng giữa hai loại. */}
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {bucket.variantLabel}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          {isSkipped
                            ? "đã đủ"
                            : `${formatNumber(bucket.currentCount)}/${formatNumber(summary.maxPerBucket)} · +${formatNumber(bucket.plannedCount)}`}
                        </span>
                      </Label>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>

      {summary.plannedBuckets === 0 ? (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <IconAlertTriangle stroke={1.5} className="mt-0.5 size-4 shrink-0" />
          Mọi bucket khớp bộ lọc đều đã đủ {copy.unit}. Đổi phạm vi sang "Toàn
          bộ bucket" nếu vẫn muốn sinh thêm.
        </p>
      ) : null}
    </div>
  )
}
