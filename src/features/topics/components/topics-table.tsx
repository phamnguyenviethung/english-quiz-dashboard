import { IconArrowDown, IconArrowUp, IconArrowsSort } from "@tabler/icons-react"

import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useUpdateTopic } from "@/features/beginner/hooks/use-update-topic.ts"
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

import { TOPIC_STATUS_META } from "../constants.ts"
import type { TopicSortableColumn, TopicsSort } from "../constants.ts"
import type { Topic } from "../hooks/use-topics.ts"
import { EditTopicDialog } from "./edit-topic-dialog.tsx"

const COLUMN_COUNT = 8

const SORT_PAIRS: Record<
  TopicSortableColumn,
  { asc: TopicsSort; desc: TopicsSort }
> = {
  id: { asc: "id_asc", desc: "id_desc" },
  name: { asc: "name_asc", desc: "name_desc" },
  createdAt: { asc: "created_asc", desc: "created_desc" },
}

function SortHeader({
  column,
  label,
  sort,
  onSortChange,
  className,
}: {
  column: TopicSortableColumn
  label: string
  sort: TopicsSort
  onSortChange: (sort: TopicsSort) => void
  className?: string
}) {
  const pair = SORT_PAIRS[column]
  const isAsc = sort === pair.asc
  const isDesc = sort === pair.desc
  const SortIcon = isAsc ? IconArrowUp : isDesc ? IconArrowDown : IconArrowsSort

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

export function TopicsTable({
  topics,
  sort,
  isPending,
  isRefetching,
  selectedId,
  onSortChange,
  onSelect,
}: {
  topics: Topic[]
  sort: TopicsSort
  isPending: boolean
  isRefetching?: boolean
  selectedId?: number
  onSortChange: (sort: TopicsSort) => void
  onSelect?: (id: number) => void
}) {
  const { setForBeginner, pendingTopicId } = useUpdateTopic()

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-2xl border">
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
            <SortHeader
              column="name"
              label="Tên"
              sort={sort}
              onSortChange={onSortChange}
            />
            <TableHead>Tên hiển thị</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead className="w-28">Trạng thái</TableHead>
            <TableHead className="w-28">Người mới</TableHead>
            <SortHeader
              column="createdAt"
              label="Tạo lúc"
              sort={sort}
              onSortChange={onSortChange}
              className="w-40"
            />
            <TableHead className="w-14">
              <span className="sr-only">Hành động</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows columns={COLUMN_COUNT} />
          ) : (
            topics.map((topic) => {
              const status =
                TOPIC_STATUS_META[topic.isActive ? "active" : "inactive"]

              return (
                <TableRow
                  key={topic.id}
                  data-state={topic.id === selectedId ? "selected" : undefined}
                  className={cn(onSelect && "cursor-pointer")}
                  onClick={() => onSelect?.(topic.id)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                    {topic.id}
                  </TableCell>
                  <TableCell
                    className="max-w-[24ch] truncate font-medium"
                    title={topic.name}
                  >
                    {topic.name}
                  </TableCell>
                  <TableCell
                    className="max-w-[24ch] truncate text-muted-foreground"
                    title={topic.displayName ?? undefined}
                  >
                    {topic.displayName ?? "-"}
                  </TableCell>
                  <TableCell
                    className="max-w-[40ch] truncate text-muted-foreground"
                    title={topic.description ?? undefined}
                  >
                    {topic.description ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Switch
                      aria-label={`Dùng "${topic.displayName ?? topic.name}" cho người mới`}
                      checked={topic.forBeginner}
                      disabled={pendingTopicId === topic.id}
                      aria-busy={pendingTopicId === topic.id}
                      onCheckedChange={(checked) =>
                        void setForBeginner(
                          topic.id,
                          topic.displayName ?? topic.name,
                          checked
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {formatDateTime(topic.createdAt)}
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <EditTopicDialog topic={topic} />
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
