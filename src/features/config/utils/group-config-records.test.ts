import { describe, expect, it } from "vitest"

import type { ConfigRecord } from "../types.ts"
import { groupConfigRecords, sectionOf, tabOf } from "./group-config-records.ts"

function record(partial: Partial<ConfigRecord>): ConfigRecord {
  return {
    recordKey: "question_pool.maxPerBucket",
    namespace: "question_pool",
    path: "maxPerBucket",
    category: "questions",
    label: "Số câu tối đa mỗi bucket",
    sortOrder: 1000,
    recordType: "num",
    value: 3,
    defaultValue: 3,
    ...partial,
  } as ConfigRecord
}

describe("sectionOf", () => {
  it("đưa quiz_distribution vào nhóm phân bổ", () => {
    expect(
      sectionOf(record({ namespace: "quiz_distribution", path: "items" }))
    ).toBe("distribution")
  })

  it("đưa mọi field manualFill* vào nhóm sinh thủ công", () => {
    expect(sectionOf(record({ path: "manualFillMinCount" }))).toBe("manual")
    expect(sectionOf(record({ path: "manualFillConcurrency" }))).toBe("manual")
  })

  it("đưa job flag và lịch cron vào nhóm tự động", () => {
    expect(
      sectionOf(record({ namespace: "job_flags", path: "poolRefillEnabled" }))
    ).toBe("automation")
    expect(
      sectionOf(record({ namespace: "pool_refill_schedule", path: "items" }))
    ).toBe("automation")
  })

  it("mặc định về nhóm ngưỡng", () => {
    expect(sectionOf(record({ path: "maxPerBucket" }))).toBe("threshold")
  })

  it("không nhầm manualFill với field khác bắt đầu bằng max", () => {
    expect(sectionOf(record({ path: "maxGenerationAttempts" }))).toBe(
      "threshold"
    )
  })
})

describe("tabOf", () => {
  it("map category sang tab tương ứng", () => {
    expect(tabOf(record({ category: "reading" }))).toBe("reading")
    expect(tabOf(record({ category: "reading_question" }))).toBe(
      "reading_question"
    )
  })

  it("category lạ rơi về tab mặc định thay vì biến mất", () => {
    expect(tabOf(record({ category: "khong_ton_tai" }))).toBe("questions")
  })
})

describe("groupConfigRecords", () => {
  it("gom 2 tầng và giữ thứ tự tab, section theo hằng khai báo", () => {
    const groups = groupConfigRecords([
      record({
        recordKey: "pool_refill_schedule.items",
        namespace: "pool_refill_schedule",
        path: "items",
        sortOrder: 1230,
      }),
      record({ recordKey: "question_pool.maxPerBucket", sortOrder: 1000 }),
      record({
        recordKey: "reading_passage.maxPerBucket",
        namespace: "reading_passage",
        category: "reading",
        sortOrder: 2000,
      }),
      record({
        recordKey: "question_pool.manualFillMinCount",
        path: "manualFillMinCount",
        sortOrder: 1100,
      }),
    ])

    expect(groups.map((group) => group.tab)).toEqual(["questions", "reading"])
    expect(groups[0].sections.map((section) => section.section)).toEqual([
      "threshold",
      "manual",
      "automation",
    ])
    expect(groups[0].records).toHaveLength(3)
  })

  it("sắp record trong section theo sortOrder", () => {
    const groups = groupConfigRecords([
      record({ recordKey: "question_pool.b", sortOrder: 1020 }),
      record({ recordKey: "question_pool.a", sortOrder: 1000 }),
    ])

    expect(groups[0].sections[0].records.map((r) => r.recordKey)).toEqual([
      "question_pool.a",
      "question_pool.b",
    ])
  })

  it("bỏ qua tab không có record nào", () => {
    const groups = groupConfigRecords([record({})])
    expect(groups).toHaveLength(1)
  })
})
