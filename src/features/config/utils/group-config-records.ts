import type { ConfigCategoryGroup, ConfigRecord } from "../types.ts"

export function groupConfigRecords(
  records: ConfigRecord[]
): ConfigCategoryGroup[] {
  const groups = new Map<string, ConfigRecord[]>()

  for (const record of records) {
    const bucket = groups.get(record.category)
    if (bucket) bucket.push(record)
    else groups.set(record.category, [record])
  }

  return [...groups.entries()].map(([category, items]) => ({
    category,
    records: [...items].sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.recordKey.localeCompare(b.recordKey)
    ),
  }))
}
