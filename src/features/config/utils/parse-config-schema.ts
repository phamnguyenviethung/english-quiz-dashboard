import type {
  ConfigFieldSchema,
  ConfigRecord,
  ConfigRecordType,
} from "../types.ts"

const RECORD_TYPES: ConfigRecordType[] = ["str", "num", "boolean", "arr", "obj"]

const MAX_DEPTH = 2

export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function pickNumber(
  source: Record<string, unknown>,
  keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "number" && Number.isFinite(value)) return value
  }
  return undefined
}

function pickString(
  source: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "string" && value) return value
  }
  return undefined
}

function pickBoolean(
  source: Record<string, unknown>,
  keys: string[]
): boolean | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "boolean") return value
  }
  return undefined
}

function pickStringArray(
  source: Record<string, unknown>,
  keys: string[]
): string[] | undefined {
  for (const key of keys) {
    const value = source[key]
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((entry) => typeof entry === "string")
    ) {
      return value
    }
  }
  return undefined
}

function isEmptySchema(schema: ConfigFieldSchema): boolean {
  return Object.values(schema).every((value) => value === undefined)
}

/**
 * `validation`/`uiSchema` khai báo `unknown` trong model nên parser chấp nhận cả
 * quy ước rút gọn (min/max/step/options) lẫn quy ước kiểu JSON-Schema
 * (minimum/maximum/multipleOf/enum). Key lạ bị bỏ qua, không bao giờ throw.
 */
export function parseConfigFieldSchema(
  value: unknown,
  depth = 0
): ConfigFieldSchema {
  if (!isPlainObject(value)) return {}

  const rawType = value.type
  const type = RECORD_TYPES.find((entry) => entry === rawType)

  const schema: ConfigFieldSchema = {
    type,
    label: pickString(value, ["label", "title"]),
    description: pickString(value, ["description", "help"]),
    min: pickNumber(value, ["min", "minimum", "minLength"]),
    max: pickNumber(value, ["max", "maximum", "maxLength"]),
    step: pickNumber(value, ["step", "multipleOf"]),
    integer: pickBoolean(value, ["integer"]),
    multiline: pickBoolean(value, ["multiline", "textarea"]),
    placeholder: pickString(value, ["placeholder"]),
    options: pickStringArray(value, ["options", "enum"]),
    unit: pickString(value, ["unit"]),
    display:
      pickString(value, ["display"]) === "percent" ? "percent" : undefined,
  }

  const rawItemFields = value.itemFields ?? value.items
  if (depth < MAX_DEPTH && isPlainObject(rawItemFields)) {
    const itemFields: Record<string, ConfigFieldSchema> = {}
    for (const [key, raw] of Object.entries(rawItemFields)) {
      const parsed = parseConfigFieldSchema(raw, depth + 1)
      if (!isEmptySchema(parsed)) itemFields[key] = parsed
    }
    if (Object.keys(itemFields).length > 0) schema.itemFields = itemFields
  }

  return schema
}

export function resolveRecordSchema(record: ConfigRecord): ConfigFieldSchema {
  const validation = parseConfigFieldSchema(record.validation)
  const uiSchema = parseConfigFieldSchema(record.uiSchema)

  const merged: ConfigFieldSchema = { ...validation }
  for (const [key, value] of Object.entries(uiSchema)) {
    if (value !== undefined) {
      Object.assign(merged, { [key]: value })
    }
  }
  return merged
}

/** Chỉ dựng bảng editor khi vừa có itemFields vừa có giá trị đúng shape. */
export function canUseRowEditor(
  schema: ConfigFieldSchema,
  value: unknown
): value is Record<string, unknown>[] {
  return (
    schema.itemFields !== undefined &&
    Array.isArray(value) &&
    value.every(isPlainObject)
  )
}
