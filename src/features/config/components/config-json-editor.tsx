import { Textarea } from "@/components/ui/textarea"

import { JSON_EDITOR_ROWS } from "../constants.ts"

export function ConfigJsonEditor({
  id,
  value,
  isInvalid,
  disabled,
  onChange,
}: {
  id: string
  value: string
  isInvalid: boolean
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <Textarea
      id={id}
      rows={JSON_EDITOR_ROWS}
      value={value}
      spellCheck={false}
      className="font-mono text-xs"
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={isInvalid}
      disabled={disabled}
    />
  )
}
