import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import type { ConfigDraft, ConfigFieldSchema, ConfigRecord } from "../types.ts"
import { canUseRowEditor } from "../utils/parse-config-schema.ts"
import { ConfigArrayEditor } from "./config-array-editor.tsx"
import { ConfigJsonEditor } from "./config-json-editor.tsx"
import { ConfigNumberInput } from "./config-number-input.tsx"

export function ConfigValueEditor({
  record,
  schema,
  draft,
  isInvalid,
  disabled,
  onChange,
}: {
  record: ConfigRecord
  schema: ConfigFieldSchema
  draft: ConfigDraft
  isInvalid: boolean
  disabled: boolean
  onChange: (draft: ConfigDraft) => void
}) {
  const id = `config-${record.recordKey}`

  if (record.recordType === "boolean") {
    return (
      <Switch
        id={id}
        checked={draft === true}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    )
  }

  if (record.recordType === "num") {
    return (
      <ConfigNumberInput
        id={id}
        schema={schema}
        draft={String(draft)}
        isInvalid={isInvalid}
        disabled={disabled}
        onChange={onChange}
      />
    )
  }

  if (record.recordType === "str") {
    if (schema.options) {
      const items = Object.fromEntries(
        schema.options.map((option) => [option, option])
      )
      return (
        <Select
          items={items}
          value={String(draft)}
          onValueChange={(value) => onChange(value ?? "")}
          disabled={disabled}
        >
          <SelectTrigger id={id} className="max-w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {schema.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (schema.multiline) {
      return (
        <Textarea
          id={id}
          rows={4}
          value={String(draft)}
          placeholder={schema.placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={isInvalid}
          disabled={disabled}
        />
      )
    }

    return (
      <Input
        id={id}
        value={String(draft)}
        placeholder={schema.placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={isInvalid}
        disabled={disabled}
      />
    )
  }

  if (Array.isArray(draft) && canUseRowEditor(schema, draft)) {
    return (
      <ConfigArrayEditor
        rows={draft}
        itemFields={schema.itemFields ?? {}}
        disabled={disabled}
        onChange={onChange}
      />
    )
  }

  return (
    <ConfigJsonEditor
      id={id}
      value={String(draft)}
      isInvalid={isInvalid}
      disabled={disabled}
      onChange={onChange}
    />
  )
}
