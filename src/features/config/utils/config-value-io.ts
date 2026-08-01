import type { ConfigDraft, ConfigFieldSchema, ConfigRecord } from "../types.ts"
import { canUseRowEditor } from "./parse-config-schema.ts"

export function stringifyJsonValue(value: unknown): string {
  if (value === undefined) return ""
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return ""
  }
}

export function toDraft(
  record: ConfigRecord,
  schema: ConfigFieldSchema,
  value: unknown = record.value
): ConfigDraft {
  switch (record.recordType) {
    case "boolean":
      return value === true
    case "num":
      return typeof value === "number" ? String(value) : ""
    case "str":
      return typeof value === "string" ? value : ""
    default:
      return canUseRowEditor(schema, value)
        ? value.map((row) => ({ ...row }))
        : stringifyJsonValue(value)
  }
}

/** Chuyển draft về giá trị gửi lên API. Chỉ gọi sau khi validate thành công. */
export function fromDraft(record: ConfigRecord, draft: ConfigDraft): unknown {
  switch (record.recordType) {
    case "boolean":
      return draft === true
    case "num":
      return Number(draft)
    case "str":
      return typeof draft === "string" ? draft : ""
    default:
      if (Array.isArray(draft)) return draft
      try {
        return JSON.parse(String(draft))
      } catch {
        return null
      }
  }
}

export function isDraftEqual(a: ConfigDraft, b: ConfigDraft): boolean {
  if (typeof a === "boolean" || typeof b === "boolean") return a === b
  if (typeof a === "string" || typeof b === "string") return a === b
  return JSON.stringify(a) === JSON.stringify(b)
}
