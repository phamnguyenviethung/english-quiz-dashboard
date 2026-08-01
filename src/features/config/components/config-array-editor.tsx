import { IconPlus, IconTrash } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
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

/** Giá trị khởi tạo cho ô mới, khớp kiểu khai báo trong itemFields. */
function emptyValueFor(schema: ConfigFieldSchema): unknown {
  if (schema.options?.length) return schema.options[0]
  if (schema.type === "boolean") return false
  if (schema.type === "num") return schema.min ?? 0
  return ""
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

  const removeRow = (rowIndex: number) => {
    onChange(rows.filter((_, index) => index !== rowIndex))
  }

  const addRow = () => {
    const next = Object.fromEntries(
      fieldKeys.map((fieldKey) => [
        fieldKey,
        emptyValueFor(itemFields[fieldKey]),
      ])
    )
    onChange([...rows, next])
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {fieldKeys.map((fieldKey) => (
                <TableHead key={fieldKey}>
                  {itemFields[fieldKey].label ?? fieldKey}
                </TableHead>
              ))}
              <TableHead className="w-12" />
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    onClick={() => removeRow(rowIndex)}
                    aria-label={`Xoá dòng ${rowIndex + 1}`}
                  >
                    <IconTrash stroke={1.5} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button variant="outline" size="sm" disabled={disabled} onClick={addRow}>
        <IconPlus stroke={1.5} data-icon="inline-start" />
        Thêm dòng
      </Button>
    </div>
  )
}
