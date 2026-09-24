import type { ConfigDraft, ConfigRecord } from "../types.ts"
import { fromDraft } from "./config-value-io.ts"
import { isPlainObject, resolveRecordSchema } from "./parse-config-schema.ts"
import { validateConfigValue } from "./validate-config-value.ts"

const MANUAL_FILL_NAMESPACES = [
  "question_pool",
  "reading_passage",
  "reading_question",
] as const

interface Resolved {
  record: ConfigRecord
  value: unknown
  /** Record đang có lỗi ở tầng field — bỏ qua khỏi check chéo để khỏi báo lỗi chồng. */
  hasFieldError: boolean
}

function resolve(
  records: ConfigRecord[],
  drafts: Record<string, ConfigDraft>
): Map<string, Resolved> {
  const map = new Map<string, Resolved>()
  for (const record of records) {
    if (!Object.hasOwn(drafts, record.recordKey)) {
      map.set(record.recordKey, {
        record,
        value: record.value,
        hasFieldError: false,
      })
      continue
    }
    const draft = drafts[record.recordKey]
    const schema = resolveRecordSchema(record)
    const hasFieldError = Boolean(validateConfigValue(record, schema, draft))
    map.set(record.recordKey, {
      record,
      value: hasFieldError ? record.value : fromDraft(record, draft),
      hasFieldError,
    })
  }
  return map
}

function numberAt(resolved: Map<string, Resolved>, recordKey: string) {
  const entry = resolved.get(recordKey)
  if (!entry || entry.hasFieldError) return undefined
  return typeof entry.value === "number" ? entry.value : undefined
}

function rowsAt(resolved: Map<string, Resolved>, recordKey: string) {
  const entry = resolved.get(recordKey)
  if (!entry || entry.hasFieldError || !Array.isArray(entry.value))
    return undefined
  return entry.value.filter(isPlainObject)
}

/**
 * Các ràng buộc chéo được Zod enforce ở server (`englishConfig.defaults.ts`). Kiểm
 * ở client để người dùng thấy lỗi ngay tại form thay vì đợi toast 400.
 */
export function validateConfigGroups(
  records: ConfigRecord[],
  drafts: Record<string, ConfigDraft>
): Record<string, string> {
  const resolved = resolve(records, drafts)
  const errors: Record<string, string> = {}

  for (const namespace of MANUAL_FILL_NAMESPACES) {
    const minKey = `${namespace}.manualFillMinCount`
    const defaultKey = `${namespace}.manualFillDefaultCount`
    const maxKey = `${namespace}.manualFillMaxCount`

    const min = numberAt(resolved, minKey)
    const value = numberAt(resolved, defaultKey)
    const max = numberAt(resolved, maxKey)
    if (value === undefined) continue

    if (min !== undefined && value < min) {
      errors[defaultKey] =
        `Giá trị mặc định phải lớn hơn hoặc bằng mức tối thiểu (${min}).`
    } else if (max !== undefined && value > max) {
      errors[defaultKey] =
        `Giá trị mặc định phải nhỏ hơn hoặc bằng mức tối đa (${max}).`
    }
  }

  const distributionKey = "quiz_distribution.items"
  const distribution = rowsAt(resolved, distributionKey)
  if (distribution) {
    if (distribution.length === 0) {
      errors[distributionKey] = "Cần ít nhất một loại câu hỏi."
    } else if (
      !distribution.some(
        (row) => row.enabled === true && Number(row.weight) > 0
      )
    ) {
      errors[distributionKey] =
        "Cần ít nhất một loại câu hỏi đang bật với trọng số lớn hơn 0."
    }
  }

  const beginnerKey = "beginner_quiz_types.items"
  const beginnerRows = rowsAt(resolved, beginnerKey)
  if (beginnerRows) {
    const quizTypes = beginnerRows.map((row) => String(row.quizType ?? ""))
    if (new Set(quizTypes).size !== quizTypes.length) {
      errors[beginnerKey] = "Mỗi loại câu hỏi chỉ được khai một lần."
    }
  }

  for (const { record } of resolved.values()) {
    if (!record.namespace.endsWith("_schedule")) continue
    const rows = rowsAt(resolved, record.recordKey)
    if (!rows) continue

    const names = rows.map((row) => String(row.name ?? "").trim())
    const emptyIndex = names.findIndex((name) => !name)
    if (emptyIndex >= 0) {
      errors[record.recordKey] =
        `Dòng ${emptyIndex + 1}: tên scheduler không được để trống.`
      continue
    }

    const blankCronIndex = rows.findIndex(
      (row) => !String(row.cron ?? "").trim()
    )
    if (blankCronIndex >= 0) {
      errors[record.recordKey] =
        `Dòng ${blankCronIndex + 1}: cron expression không được để trống.`
      continue
    }

    if (new Set(names).size !== names.length) {
      errors[record.recordKey] = "Tên scheduler không được trùng nhau."
    }
  }

  return errors
}
