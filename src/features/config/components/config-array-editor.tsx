import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { ConfigFieldSchema } from "../types.ts"

function CellEditor({
  fieldKey,
  schema,
  value,
  disabled,
  onChange,
}: {
  fieldKey: string
  schema: ConfigFieldSchema
  value: unknown
  disabled: boolean
  onChange: (next: unknown) => void
}) {
  if (schema.type === "boolean") {
    return (
      <Switch
        checked={value === true}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    )
  }

  if (schema.options) {
    const items = Object.fromEntries(
      schema.options.map((option) => [option, option])
    )
    return (
      <Select
        items={items}
        value={typeof value === "string" ? value : ""}
        onValueChange={(next) => onChange(next ?? "")}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
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

  if (schema.type === "num") {
    return (
      <Input
        type="number"
        value={typeof value === "number" ? String(value) : ""}
        min={schema.min}
        max={schema.max}
        step={schema.step ?? (schema.integer ? 1 : "any")}
        className="w-28 tabular-nums"
        onChange={(event) => {
          const raw = event.target.value
          onChange(raw === "" ? "" : Number(raw))
        }}
        disabled={disabled}
      />
    )
  }

  return (
    <Input
      value={typeof value === "string" ? value : String(value ?? "")}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-label={fieldKey}
    />
  )
}

export function ConfigArrayEditor({
  rows,
  itemFields,
  disabled,
  onChange,
}: {
  rows: Record<string, unknown>[]
  itemFields: Record<string, ConfigFieldSchema>
  disabled: boolean
  onChange: (rows: Record<string, unknown>[]) => void
}) {
  const fieldKeys = Object.keys(itemFields)

  const updateCell = (rowIndex: number, fieldKey: string, next: unknown) => {
    onChange(
      rows.map((row, index) =>
        index === rowIndex ? { ...row, [fieldKey]: next } : row
      )
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            {fieldKeys.map((fieldKey) => (
              <TableHead key={fieldKey}>
                {itemFields[fieldKey].label ?? fieldKey}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {fieldKeys.map((fieldKey) => (
                <TableCell key={fieldKey}>
                  <CellEditor
                    fieldKey={fieldKey}
                    schema={itemFields[fieldKey]}
                    value={row[fieldKey]}
                    disabled={disabled}
                    onChange={(next) => updateCell(rowIndex, fieldKey, next)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
