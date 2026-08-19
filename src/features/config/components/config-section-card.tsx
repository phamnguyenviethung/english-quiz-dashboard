import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldSeparator } from "@/components/ui/field"

import { CONFIG_SECTION_META } from "../constants.ts"
import type { ConfigDraft, ConfigRecord, ConfigSectionGroup } from "../types.ts"
import { ConfigRecordRow } from "./config-record-row.tsx"

export function ConfigSectionCard({
  group,
  getDraft,
  groupErrors,
  savingKey,
  resettingKey,
  onDraftChange,
  onSave,
  onRevert,
  onReset,
}: {
  group: ConfigSectionGroup
  getDraft: (record: ConfigRecord) => ConfigDraft
  groupErrors: Record<string, string>
  savingKey: string | undefined
  resettingKey: string | undefined
  onDraftChange: (record: ConfigRecord, draft: ConfigDraft) => void
  onSave: (record: ConfigRecord, value: unknown) => void
  onRevert: (record: ConfigRecord) => void
  onReset: (record: ConfigRecord) => void
}) {
  const meta = CONFIG_SECTION_META[group.section]
  const SectionIcon = meta.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <SectionIcon className="size-4 text-muted-foreground" stroke={1.5} />
          <CardTitle>{meta.label}</CardTitle>
        </div>
        <CardDescription>{meta.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {group.records.map((record, index) => (
          <div key={record.recordKey}>
            {index > 0 ? <FieldSeparator className="mb-6" /> : null}
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
      </CardContent>
    </Card>
  )
}
