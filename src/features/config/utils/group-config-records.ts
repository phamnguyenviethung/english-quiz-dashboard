import {
  CONFIG_SECTIONS,
  CONFIG_TABS,
  DEFAULT_CONFIG_TAB,
} from "../constants.ts"
import type {
  ConfigRecord,
  ConfigSectionGroup,
  ConfigSectionKey,
  ConfigTabGroup,
  ConfigTabKey,
} from "../types.ts"

export function tabOf(record: ConfigRecord): ConfigTabKey {
  const tab = CONFIG_TABS.find((value) => value === record.category)
  return tab ?? DEFAULT_CONFIG_TAB
}

/**
 * Section suy ra từ `namespace`/`path` thay vì một bảng tra theo recordKey: record
 * mới thêm ở backend tự rơi vào đúng nhóm mà không phải sửa dashboard.
 */
export function sectionOf(record: ConfigRecord): ConfigSectionKey {
  if (
    record.namespace === "quiz_distribution" ||
    record.namespace === "beginner_quiz_types"
  )
    return "distribution"
  if (record.path.startsWith("manualFill")) return "manual"
  if (
    record.namespace === "job_flags" ||
    record.namespace.endsWith("_schedule")
  )
    return "automation"
  return "threshold"
}

function bySortOrder(a: ConfigRecord, b: ConfigRecord): number {
  return a.sortOrder - b.sortOrder || a.recordKey.localeCompare(b.recordKey)
}

export function groupConfigRecords(records: ConfigRecord[]): ConfigTabGroup[] {
  const byTab = new Map<ConfigTabKey, ConfigRecord[]>()
  for (const record of records) {
    const tab = tabOf(record)
    const bucket = byTab.get(tab)
    if (bucket) bucket.push(record)
    else byTab.set(tab, [record])
  }

  return CONFIG_TABS.filter((tab) => byTab.has(tab)).map((tab) => {
    const tabRecords = [...(byTab.get(tab) ?? [])].sort(bySortOrder)

    const bySection = new Map<ConfigSectionKey, ConfigRecord[]>()
    for (const record of tabRecords) {
      const section = sectionOf(record)
      const bucket = bySection.get(section)
      if (bucket) bucket.push(record)
      else bySection.set(section, [record])
    }

    const sections: ConfigSectionGroup[] = CONFIG_SECTIONS.filter((section) =>
      bySection.has(section)
    ).map((section) => ({
      section,
      records: bySection.get(section) ?? [],
    }))

    return { tab, sections, records: tabRecords }
  })
}
