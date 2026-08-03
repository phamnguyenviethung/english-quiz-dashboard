import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { SCOPE_OPTIONS } from "../constants.ts"

export function ScopeCheckboxGroup({
  value,
  onChange,
  disabled,
  idPrefix = "scope",
}: {
  value: string[]
  onChange: (scopes: string[]) => void
  disabled?: boolean
  idPrefix?: string
}) {
  const selected = new Set(value)

  const toggle = (scope: string, checked: boolean) => {
    // Giữ nguyên thứ tự của SCOPE_OPTIONS để payload ổn định giữa các lần lưu.
    const next = new Set(selected)
    if (checked) next.add(scope)
    else next.delete(scope)
    onChange(SCOPE_OPTIONS.map((option) => option.value).filter((s) => next.has(s)))
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SCOPE_OPTIONS.map((option) => {
        const id = `${idPrefix}-${option.value.replace(":", "-")}`
        return (
          <div key={option.value} className="flex items-start gap-2.5">
            <Checkbox
              id={id}
              className="mt-0.5"
              checked={selected.has(option.value)}
              onCheckedChange={(checked) => toggle(option.value, checked)}
              disabled={disabled}
            />
            <div className="grid gap-0.5">
              <Label htmlFor={id} className="font-medium">
                {option.label}
              </Label>
              <span className="font-mono text-[11px] text-muted-foreground">
                {option.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
