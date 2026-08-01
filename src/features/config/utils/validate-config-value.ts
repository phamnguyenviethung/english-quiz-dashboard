import type { ConfigDraft, ConfigFieldSchema, ConfigRecord } from "../types.ts"
import { isPlainObject } from "./parse-config-schema.ts"

function validateNumber(
  raw: string,
  schema: ConfigFieldSchema,
  label = "Giá trị"
): string | undefined {
  if (!raw.trim()) return `${label} không được để trống.`

  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return `${label} phải là một số hợp lệ.`
  if (schema.integer && !Number.isInteger(parsed))
    return `${label} phải là số nguyên.`
  if (schema.min !== undefined && parsed < schema.min)
    return `${label} phải lớn hơn hoặc bằng ${schema.min}.`
  if (schema.max !== undefined && parsed > schema.max)
    return `${label} phải nhỏ hơn hoặc bằng ${schema.max}.`

  return undefined
}

function validateString(
  raw: string,
  schema: ConfigFieldSchema,
  label = "Giá trị"
): string | undefined {
  if (schema.options && !schema.options.includes(raw))
    return `${label} phải là một trong: ${schema.options.join(", ")}.`
  if (schema.min !== undefined && raw.length < schema.min)
    return `${label} cần ít nhất ${schema.min} ký tự.`
  if (schema.max !== undefined && raw.length > schema.max)
    return `${label} tối đa ${schema.max} ký tự.`

  return undefined
}

function validateRows(
  rows: Record<string, unknown>[],
  schema: ConfigFieldSchema
): string | undefined {
  const itemFields = schema.itemFields
  if (!itemFields) return undefined

  for (const [index, row] of rows.entries()) {
    for (const [key, fieldSchema] of Object.entries(itemFields)) {
      const label = `Dòng ${index + 1} · ${fieldSchema.label ?? key}`
      const value = row[key]

      if (fieldSchema.type === "num") {
        const error = validateNumber(String(value ?? ""), fieldSchema, label)
        if (error) return error
      } else if (fieldSchema.type === "str") {
        const error = validateString(String(value ?? ""), fieldSchema, label)
        if (error) return error
      }
    }
  }

  return undefined
}

export function validateConfigValue(
  record: ConfigRecord,
  schema: ConfigFieldSchema,
  draft: ConfigDraft
): string | undefined {
  switch (record.recordType) {
    case "boolean":
      return typeof draft === "boolean"
        ? undefined
        : "Giá trị phải là bật hoặc tắt."

    case "num":
      return validateNumber(String(draft), schema)

    case "str":
      return validateString(String(draft), schema)

    default: {
      if (Array.isArray(draft)) return validateRows(draft, schema)

      const raw = String(draft).trim()
      if (!raw) return "Giá trị không được để trống."

      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        return "JSON không hợp lệ."
      }

      if (record.recordType === "arr" && !Array.isArray(parsed))
        return "Giá trị phải là một mảng JSON."
      if (record.recordType === "obj" && !isPlainObject(parsed))
        return "Giá trị phải là một object JSON."

      return undefined
    }
  }
}
