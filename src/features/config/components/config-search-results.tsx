import { IconChevronRight, IconSearchOff } from "@tabler/icons-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { CONFIG_SECTION_META, CONFIG_TAB_META } from "../constants.ts"
import type {
  ConfigDraft,
  ConfigRecord,
  ConfigRecordLocation,
} from "../types.ts"
import { ConfigRecordRow } from "./config-record-row.tsx"

export function ConfigSearchResults({
  results,
  query,
  getDraft,
  groupErrors,
  savingKey,
  resettingKey,
  onDraftChange,
  onSave,
  onRevert,
  onReset,
}: {
  results: ConfigRecordLocation[]
  query: string
  getDraft: (record: ConfigRecord) => ConfigDraft
  groupErrors: Record<string, string>
  savingKey: string | undefined
  resettingKey: string | undefined
  onDraftChange: (record: ConfigRecord, draft: ConfigDraft) => void
  onSave: (record: ConfigRecord, value: unknown) => void
  onRevert: (record: ConfigRecord) => void
  onReset: (record: ConfigRecord) => void
}) {
  if (results.length === 0) {
    return (
      <Empty className="rounded-2xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconSearchOff stroke={1.5} />
          </EmptyMedia>
          <EmptyTitle>Không có mục nào khớp "{query}"</EmptyTitle>
          <EmptyDescription>
            Thử tìm theo tên hiển thị hoặc record key, ví dụ "maxPerBucket".
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {results.length} mục khớp "{query}".
      </p>

      <div className="divide-y rounded-2xl border">
        {results.map(({ record, tab, section }) => (
          <div key={record.recordKey} className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {CONFIG_TAB_META[tab].label}
              <IconChevronRight className="size-3 shrink-0" stroke={1.5} />
              {CONFIG_SECTION_META[section].label}
            </div>

            <ConfigRecordRow
              record={record}
              draft={getDraft(record)}
              groupError={groupErrors[record.recordKey]}
              isSaving={savingKey === record.recordKey}
              isResetting={resettingKey === record.recordKey}
              onDraftChange={(draft) => onDraftChange(record, draft)}
              onSave={(value) => onSave(record, value)}
              onRevert={() => onRevert(record)}
              onReset={() => onReset(record)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
