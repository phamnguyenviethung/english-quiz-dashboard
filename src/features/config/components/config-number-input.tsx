import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"

import type { ConfigFieldSchema } from "../types.ts"
import {
  fromPercentDisplay,
  scalePercentBound,
  toPercentDisplay,
} from "../utils/percent-value.ts"

export function ConfigNumberInput({
  id,
  schema,
  draft,
  isInvalid,
  disabled,
  onChange,
}: {
  id: string
  schema: ConfigFieldSchema
  draft: string
  isInvalid: boolean
  disabled: boolean
  onChange: (draft: string) => void
}) {
  const isPercent = schema.display === "percent"
  const min = isPercent ? scalePercentBound(schema.min) : schema.min
  const max = isPercent ? scalePercentBound(schema.max) : schema.max
  const step = isPercent ? 1 : (schema.step ?? (schema.integer ? 1 : "any"))

  return (
    <InputGroup className={schema.unit ? "max-w-56" : "max-w-48"}>
      <InputGroupInput
        id={id}
        type="number"
        className="tabular-nums"
        value={isPercent ? toPercentDisplay(draft) : draft}
        min={min}
        max={max}
        step={step}
        onChange={(event) =>
          onChange(
            isPercent
              ? fromPercentDisplay(event.target.value)
              : event.target.value
          )
        }
        aria-invalid={isInvalid}
        disabled={disabled}
      />
      {schema.unit ? (
        <InputGroupAddon align="inline-end">
          <InputGroupText>{schema.unit}</InputGroupText>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}
