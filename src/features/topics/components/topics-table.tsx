import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime } from "@/lib/format.ts"

import { TOPIC_STATUS_META } from "../constants.ts"
import type { Topic } from "../hooks/use-topics.ts"

const SKELETON_ROWS = 5

export function TopicsTable({
  topics,
  isPending,
}: {
  topics: Topic[]
  isPending: boolean
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Tên hiển thị</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead className="w-28">Trạng thái</TableHead>
            <TableHead className="w-40">Tạo lúc</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending
            ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-3xl" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                </TableRow>
              ))
            : topics.map((topic) => {
                const status =
                  TOPIC_STATUS_META[topic.isActive ? "active" : "inactive"]

                return (
                  <TableRow key={topic.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {topic.id}
                    </TableCell>
                    <TableCell className="font-medium">{topic.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {topic.displayName ?? "-"}
                    </TableCell>
                    <TableCell className="max-w-[40ch] truncate text-muted-foreground">
                      {topic.description ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {formatDateTime(topic.createdAt)}
                    </TableCell>
                  </TableRow>
                )
              })}
        </TableBody>
      </Table>
    </div>
  )
}
