import type { ConfigDraft, ConfigRecord, ConfigTabGroup } from "../types.ts"
import { ConfigSectionCard } from "./config-section-card.tsx"

export function ConfigTabPanel({
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
  group: ConfigTabGroup
  getDraft: (record: ConfigRecord) => ConfigDraft
  groupErrors: Record<string, string>
  savingKey: string | undefined
  resettingKey: string | undefined
  onDraftChange: (record: ConfigRecord, draft: ConfigDraft) => void
  onSave: (record: ConfigRecord, value: unknown) => void
  onRevert: (record: ConfigRecord) => void
  onReset: (record: ConfigRecord) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      {group.sections.map((section) => (
        <ConfigSectionCard
          key={section.section}
          group={section}
          getDraft={getDraft}
          groupErrors={groupErrors}
          savingKey={savingKey}
          resettingKey={resettingKey}
          onDraftChange={onDraftChange}
          onSave={onSave}
          onRevert={onRevert}
          onReset={onReset}
        />
      ))}
    </div>
  )
}
