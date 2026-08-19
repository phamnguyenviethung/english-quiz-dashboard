import type { ConfigRecord, ConfigRecordLocation } from "../types.ts"
import { sectionOf, tabOf } from "./group-config-records.ts"

/** Bỏ dấu tiếng Việt để gõ "cau hoi" vẫn khớp "câu hỏi". */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
}

export function filterConfigRecords(
  records: ConfigRecord[],
  query: string
): ConfigRecordLocation[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  return records
    .filter((record) => {
      const haystack = normalize(
        [record.label, record.recordKey, record.description ?? ""].join(" ")
      )
      return terms.every((term) => haystack.includes(term))
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((record) => ({
      record,
      tab: tabOf(record),
      section: sectionOf(record),
    }))
}
