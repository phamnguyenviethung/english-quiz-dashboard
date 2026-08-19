import { IconArrowBackUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  groupError,
  isSaving,
  isResetting,
  onDraftChange,
  onSave,
  onRevert,
  onReset,
}: {
  record: ConfigRecord
  draft: ConfigDraft
  groupError?: string
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
  const fieldError = validateConfigValue(record, schema, draft)
  const error = fieldError ?? groupError
  const isBusy = isSaving || isResetting
  const isChangedFromDefault =
    JSON.stringify(record.value) !== JSON.stringify(record.defaultValue)

  // Switch tự lưu ngay: job flag là kill switch, bấm là phải ăn liền chứ không
  // chờ bấm "Lưu tất cả". Vì vậy switch cũng không bao giờ ở trạng thái dirty.
  const handleChange = (next: ConfigDraft) => {
    onDraftChange(next)
    if (record.recordType === "boolean") {
      if (validateConfigValue(record, schema, next)) return
      onSave(fromDraft(record, next))
    }
  }

  const hint =
    record.recordType === "num" ? rangeHint(schema.min, schema.max) : undefined
  const description = record.description ?? schema.description
  const isWide = record.recordType === "arr" || record.recordType === "obj"

  return (
    <Field
      data-invalid={Boolean(error)}
      data-dirty={isDirty || undefined}
      className={
        isWide
          ? "gap-3"
          : "gap-3 sm:grid sm:grid-cols-[minmax(0,20rem)_1fr] sm:items-start sm:gap-6"
      }
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <FieldLabel htmlFor={`config-${record.recordKey}`}>
            {label}
          </FieldLabel>
          {isDirty ? <Badge variant="outline">Chưa lưu</Badge> : null}
        </div>

        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}

        <Tooltip>
          <TooltipTrigger
            render={
              <code className="w-fit font-mono text-[11px] text-muted-foreground">
                {record.recordKey}
              </code>
            }
          />
          <TooltipContent>Record key dùng khi gọi API</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-2">
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

        {isDirty || isChangedFromDefault ? (
          <div className="flex flex-wrap items-center gap-1">
            {isDirty ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={isBusy}
                onClick={onRevert}
              >
                <IconArrowBackUp stroke={1.5} data-icon="inline-start" />
                Hoàn tác
              </Button>
            ) : null}

            {isChangedFromDefault ? (
              <ResetConfigDialog
                label={label}
                disabled={isBusy}
                onConfirm={onReset}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </Field>
  )
}
