import { createFileRoute } from "@tanstack/react-router"
import { IconAdjustmentsOff, IconRefresh } from "@tabler/icons-react"

import { getGetEnglishConfigRecordsQueryOptions } from "@/apis/english-config/english-config.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfigCategorySection } from "@/features/config/components/config-category-section.tsx"
import { ConfigSnapshotSection } from "@/features/config/components/config-snapshot-section.tsx"
import { useConfigDrafts } from "@/features/config/hooks/use-config-drafts.ts"
import { useConfigRecords } from "@/features/config/hooks/use-config-records.ts"
import { useResetConfigRecord } from "@/features/config/hooks/use-reset-config-record.ts"
import { useUpdateConfigRecord } from "@/features/config/hooks/use-update-config-record.ts"
import type { ConfigRecord } from "@/features/config/types.ts"
import { resolveRecordSchema } from "@/features/config/utils/parse-config-schema.ts"

export const Route = createFileRoute("/_dashboard/config")({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(getGetEnglishConfigRecordsQueryOptions()),
  component: ConfigPage,
})

function ConfigPage() {
  const { records, groups, isPending, isError, error, refetch, isRefetching } =
    useConfigRecords()
  const { getDraft, setDraft, clearDraft, clearAll, dirtyKeys } =
    useConfigDrafts(records)
  const { updateRecord, pendingRecordKey: savingKey } = useUpdateConfigRecord()
  const { resetRecord, pendingRecordKey: resettingKey } = useResetConfigRecord()

  const labelOf = (record: ConfigRecord) => record.label || record.recordKey

  const handleSave = async (record: ConfigRecord, value: unknown) => {
    const saved = await updateRecord(record.recordKey, value, labelOf(record))
    if (saved) clearDraft(record.recordKey)
  }

  const handleReset = async (record: ConfigRecord) => {
    const reset = await resetRecord(record.recordKey, labelOf(record))
    if (reset) clearDraft(record.recordKey)
  }

  return (
    <>
      <PageHeader
        title="Cấu hình"
        description="Tham số vận hành của bot: kho câu hỏi, phân bổ loại câu hỏi và cờ bật/tắt job."
        actions={
          <>
            {dirtyKeys.length > 0 ? (
              <>
                <Badge variant="outline">
                  {dirtyKeys.length} thay đổi chưa lưu
                </Badge>
                <Button variant="ghost" onClick={clearAll}>
                  Huỷ tất cả
                </Button>
              </>
            ) : null}
            <Button
              variant="outline"
              onClick={() => void refetch()}
              disabled={isRefetching}
            >
              <IconRefresh stroke={1.5} data-icon="inline-start" />
              Làm mới
            </Button>
          </>
        }
      />

      {isError ? (
        <QueryError
          title="Không tải được cấu hình"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : records.length === 0 ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconAdjustmentsOff stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Chưa có mục cấu hình nào</EmptyTitle>
            <EmptyDescription>
              Backend chưa khai báo record cấu hình nào để chỉnh từ dashboard.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {groups.map((group) => (
            <ConfigCategorySection
              key={group.category}
              group={group}
              getDraft={(record) =>
                getDraft(record, resolveRecordSchema(record))
              }
              savingKey={savingKey}
              resettingKey={resettingKey}
              onDraftChange={(record, draft) =>
                setDraft(record.recordKey, draft)
              }
              onSave={(record, value) => void handleSave(record, value)}
              onRevert={(record) => clearDraft(record.recordKey)}
              onReset={(record) => void handleReset(record)}
            />
          ))}

          <ConfigSnapshotSection />
        </>
      )}
    </>
  )
}
