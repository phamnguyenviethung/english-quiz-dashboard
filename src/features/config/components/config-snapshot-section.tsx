import { CollapsibleJson } from "@/components/common/json-block.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import { Skeleton } from "@/components/ui/skeleton"

import { useConfigSnapshot } from "../hooks/use-config-snapshot.ts"

export function ConfigSnapshotSection() {
  const { snapshot, isPending, isError, error, refetch } = useConfigSnapshot()

  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm font-medium">Snapshot đang áp dụng</p>
      <p className="mt-1 mb-3 text-xs text-muted-foreground">
        Cấu hình đã gộp mà bot đọc trực tiếp. Cập nhật lại sau mỗi lần lưu.
      </p>

      {isPending ? (
        <Skeleton className="h-8 w-full" />
      ) : isError ? (
        <QueryError
          title="Không tải được snapshot"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : (
        <CollapsibleJson label="Xem JSON" value={snapshot} />
      )}
    </div>
  )
}
