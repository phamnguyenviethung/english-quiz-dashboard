import { IconDeviceFloppy } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

import type { ConfigDraft, ConfigRecord } from "../types.ts"
import { fromDraft, isDraftEqual, toDraft } from "../utils/config-value-io.ts"
import { resolveRecordSchema } from "../utils/parse-config-schema.ts"
import { validateConfigValue } from "../utils/validate-config-value.ts"
import { ConfigValueEditor } from "./config-value-editor.tsx"
import { ResetConfigDialog } from "./reset-config-dialog.tsx"

function rangeHint(min?: number, max?: number): string | undefined {
  if (min !== undefined && max !== undefined) return `Từ ${min} đến ${max}.`
  if (min !== undefined) return `Tối thiểu ${min}.`
  if (max !== undefined) return `Tối đa ${max}.`
  return undefined
}

export function ConfigRecordRow({
  record,
  draft,
  isSaving,
  isResetting,
  onDraftChange,
  onSave,
  onRevert,
  onReset,
}: {
  record: ConfigRecord
  draft: ConfigDraft
  isSaving: boolean
  isResetting: boolean
  onDraftChange: (draft: ConfigDraft) => void
  onSave: (value: unknown) => void
  onRevert: () => void
  onReset: () => void
}) {
  const schema = resolveRecordSchema(record)
  const label = record.label || record.recordKey
  const original = toDraft(record, schema)
  const isDirty = !isDraftEqual(draft, original)
  const error = validateConfigValue(record, schema, draft)
  const isBusy = isSaving || isResetting
  const isChangedFromDefault =
    JSON.stringify(record.value) !== JSON.stringify(record.defaultValue)

  const save = (next: ConfigDraft) => {
    if (validateConfigValue(record, schema, next)) return
    onSave(fromDraft(record, next))
  }

  const handleChange = (next: ConfigDraft) => {
    onDraftChange(next)
    if (record.recordType === "boolean") save(next)
  }

  const hint =
    record.recordType === "num" ? rangeHint(schema.min, schema.max) : undefined
  const description = record.description ?? schema.description

  return (
    <Field data-invalid={Boolean(error)} className="gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <FieldLabel htmlFor={`config-${record.recordKey}`}>{label}</FieldLabel>
        {isChangedFromDefault ? <Badge variant="outline">Đã đổi</Badge> : null}
        <code className="ml-auto font-mono text-xs text-muted-foreground">
          {record.recordKey}
        </code>
      </div>

      {description ? <FieldDescription>{description}</FieldDescription> : null}

      <ConfigValueEditor
        record={record}
        schema={schema}
        draft={draft}
        isInvalid={Boolean(error)}
        disabled={isBusy}
        onChange={handleChange}
      />

      {hint && !error ? <FieldDescription>{hint}</FieldDescription> : null}
      <FieldError errors={[error ? { message: error } : undefined]} />

      <div className="flex flex-wrap items-center gap-2">
        {isDirty && record.recordType !== "boolean" ? (
          <>
            <Button
              size="sm"
              disabled={Boolean(error) || isBusy}
              onClick={() => save(draft)}
            >
              {isSaving ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <IconDeviceFloppy stroke={1.5} data-icon="inline-start" />
              )}
              Lưu
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={onRevert}
            >
              Hoàn tác
            </Button>
          </>
        ) : null}

        {isChangedFromDefault ? (
          <ResetConfigDialog
            label={label}
            disabled={isBusy}
            onConfirm={onReset}
          />
        ) : null}
      </div>
    </Field>
  )
}
