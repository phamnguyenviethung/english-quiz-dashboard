import { Link } from "@tanstack/react-router"
import {
  IconAlertTriangle,
  IconChartGridDots,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleX,
  IconPlus,
} from "@tabler/icons-react"
import type { Icon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Topic } from "@/features/topics/hooks/use-topics.ts"
import { cn } from "@/lib/utils"

import { BEGINNER_LEVELS } from "../constants.ts"
import { getCoverageTone } from "../utils/coverage.ts"
import type {
  CoverageCell,
  CoverageTone,
  TopicCoverageRow,
} from "../utils/coverage.ts"

const TONE_META: Record<
  CoverageTone,
  { icon: Icon; className: string; label: string }
> = {
  full: {
    icon: IconCircleCheck,
    className:
      "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    label: "Đủ",
  },
  partial: {
    icon: IconAlertTriangle,
    className:
      "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
    label: "Thiếu một phần",
  },
  low: {
    icon: IconCircleX,
    className:
      "bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
    label: "Thiếu nhiều",
  },
  empty: {
    icon: IconCircleDashed,
    className: "bg-muted text-muted-foreground",
    label: "Chưa có bucket",
  },
}

function CoverageCellView({
  cell,
  label,
}: {
  cell: CoverageCell
  label: string
}) {
  const tone = getCoverageTone(cell)
  const meta = TONE_META[tone]
  const ToneIcon = meta.icon
  return (
    <span
      className={cn(
        "inline-flex min-w-16 items-center justify-center gap-1 rounded-lg px-2 py-1 text-xs font-medium tabular-nums",
        meta.className
      )}
      aria-label={`${label}: ${cell.current}/${cell.target} — ${meta.label}`}
      title={meta.label}
    >
      <ToneIcon className="size-3.5 shrink-0" stroke={1.75} aria-hidden />
      {tone === "empty" ? "—" : `${cell.current}/${cell.target}`}
    </span>
  )
}

function CoverageLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {(Object.keys(TONE_META) as CoverageTone[]).map((tone) => {
        const meta = TONE_META[tone]
        const ToneIcon = meta.icon
        return (
          <span key={tone} className="inline-flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex size-5 items-center justify-center rounded-md",
                meta.className
              )}
            >
              <ToneIcon className="size-3.5" stroke={1.75} aria-hidden />
            </span>
            {meta.label}
          </span>
        )
      })}
      <span>Số = tồn kho / mục tiêu (gộp mọi loại câu)</span>
    </div>
  )
}

export function BeginnerCoverageMatrix({
  rows,
  topicsById,
  isPending,
}: {
  rows: TopicCoverageRow[]
  topicsById: Map<number, Topic>
  isPending: boolean
}) {
  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <Empty className="rounded-2xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconChartGridDots stroke={1.5} />
          </EmptyMedia>
          <EmptyTitle>Chưa có chủ đề nào cho người mới</EmptyTitle>
          <EmptyDescription>
            Bật cờ người mới cho ít nhất một chủ đề để bắt đầu sinh câu hỏi và
            bài đọc A1–B1.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2} className="min-w-40 align-bottom">
                Chủ đề
              </TableHead>
              <TableHead
                colSpan={BEGINNER_LEVELS.length}
                className="text-center"
              >
                Câu hỏi
              </TableHead>
              <TableHead
                colSpan={BEGINNER_LEVELS.length}
                className="border-l text-center"
              >
                Bài đọc
              </TableHead>
              <TableHead rowSpan={2} className="w-32 text-right align-bottom">
                <span className="sr-only">Hành động</span>
              </TableHead>
            </TableRow>
            <TableRow>
              {BEGINNER_LEVELS.map((level) => (
                <TableHead key={`pool-${level}`} className="text-center">
                  {level}
                </TableHead>
              ))}
              {BEGINNER_LEVELS.map((level, index) => (
                <TableHead
                  key={`reading-${level}`}
                  className={cn("text-center", index === 0 && "border-l")}
                >
                  {level}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const topic = topicsById.get(row.topicId)
              const topicName =
                topic?.displayName ?? topic?.name ?? `#${row.topicId}`
              return (
                <TableRow key={row.topicId}>
                  <TableCell
                    className="max-w-[24ch] truncate font-medium"
                    title={topicName}
                  >
                    {topicName}
                  </TableCell>
                  {BEGINNER_LEVELS.map((level) => (
                    <TableCell key={`pool-${level}`} className="text-center">
                      <CoverageCellView
                        cell={row.pool[level]}
                        label={`Câu hỏi ${level}`}
                      />
                    </TableCell>
                  ))}
                  {BEGINNER_LEVELS.map((level, index) => (
                    <TableCell
                      key={`reading-${level}`}
                      className={cn("text-center", index === 0 && "border-l")}
                    >
                      <CoverageCellView
                        cell={row.reading[level]}
                        label={`Bài đọc ${level}`}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <Link
                          to="/refill"
                          search={{
                            audience: "beginner",
                            topicIds: String(row.topicId),
                          }}
                        />
                      }
                    >
                      <IconPlus stroke={1.5} data-icon="inline-start" />
                      Bổ sung
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <CoverageLegend />
    </div>
  )
}
