import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldSeparator } from "@/components/ui/field"

import { getCategoryMeta } from "../constants.ts"
import type {
  ConfigCategoryGroup,
  ConfigDraft,
  ConfigRecord,
} from "../types.ts"
import { ConfigRecordRow } from "./config-record-row.tsx"

export function ConfigCategorySection({
  group,
  getDraft,
  savingKey,
  resettingKey,
  onDraftChange,
  onSave,
  onRevert,
  onReset,
}: {
  group: ConfigCategoryGroup
  getDraft: (record: ConfigRecord) => ConfigDraft
  savingKey: string | undefined
  resettingKey: string | undefined
  onDraftChange: (record: ConfigRecord, draft: ConfigDraft) => void
  onSave: (record: ConfigRecord, value: unknown) => void
  onRevert: (record: ConfigRecord) => void
  onReset: (record: ConfigRecord) => void
}) {
  const meta = getCategoryMeta(group.category)
  const CategoryIcon = meta.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CategoryIcon className="size-4 text-muted-foreground" stroke={1.5} />
          <CardTitle>{meta.label}</CardTitle>
        </div>
        {meta.description ? (
          <CardDescription>{meta.description}</CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        {group.records.map((record, index) => (
          <div key={record.recordKey}>
            {index > 0 ? <FieldSeparator className="mb-6" /> : null}
            <ConfigRecordRow
              record={record}
              draft={getDraft(record)}
              isSaving={savingKey === record.recordKey}
              isResetting={resettingKey === record.recordKey}
              onDraftChange={(draft) => onDraftChange(record, draft)}
              onSave={(value) => onSave(record, value)}
              onRevert={() => onRevert(record)}
              onReset={() => onReset(record)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
