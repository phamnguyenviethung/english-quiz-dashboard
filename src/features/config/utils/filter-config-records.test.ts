import { describe, expect, it } from "vitest"

import type { ConfigRecord } from "../types.ts"
import { filterConfigRecords } from "./filter-config-records.ts"

function record(partial: Partial<ConfigRecord>): ConfigRecord {
  return {
    recordKey: "question_pool.maxPerBucket",
    namespace: "question_pool",
    path: "maxPerBucket",
    category: "questions",
    label: "Số câu tối đa mỗi bucket",
    description: "Số câu hỏi giữ sẵn cho mỗi bucket.",
    sortOrder: 1000,
    recordType: "num",
    value: 3,
    defaultValue: 3,
    ...partial,
  } as ConfigRecord
}

const RECORDS = [
  record({}),
  record({
    recordKey: "reading_passage.maxPerBucket",
    namespace: "reading_passage",
    category: "reading",
    label: "Số bài đọc tối đa mỗi bucket",
    description: "Số bài đọc giữ sẵn cho mỗi bucket.",
    sortOrder: 2000,
  }),
  record({
    recordKey: "job_flags.poolRefillEnabled",
    namespace: "job_flags",
    path: "poolRefillEnabled",
    label: "Bật Pool-Refill (scheduled)",
    description: "Tắt sẽ bỏ qua refill theo lịch.",
    sortOrder: 1210,
  }),
]

describe("filterConfigRecords", () => {
  it("trả rỗng khi query rỗng", () => {
    expect(filterConfigRecords(RECORDS, "")).toEqual([])
    expect(filterConfigRecords(RECORDS, "   ")).toEqual([])
  })

  it("khớp theo recordKey trên nhiều pipeline", () => {
    const results = filterConfigRecords(RECORDS, "maxPerBucket")
    expect(results.map((item) => item.record.recordKey)).toEqual([
      "question_pool.maxPerBucket",
      "reading_passage.maxPerBucket",
    ])
  })

  it("gắn kèm tab và section cho từng kết quả", () => {
    const [first, second] = filterConfigRecords(RECORDS, "maxPerBucket")
    expect(first).toMatchObject({ tab: "questions", section: "threshold" })
    expect(second).toMatchObject({ tab: "reading", section: "threshold" })
  })

  it("khớp không dấu và không phân biệt hoa thường", () => {
    const results = filterConfigRecords(RECORDS, "bai doc")
    expect(results).toHaveLength(1)
    expect(results[0].record.recordKey).toBe("reading_passage.maxPerBucket")
  })

  it("mọi từ khoá đều phải khớp", () => {
    expect(filterConfigRecords(RECORDS, "số câu")).toHaveLength(1)
    expect(filterConfigRecords(RECORDS, "số khong_ton_tai")).toHaveLength(0)
  })

  it("khớp cả trong description", () => {
    const results = filterConfigRecords(RECORDS, "theo lịch")
    expect(results[0].record.recordKey).toBe("job_flags.poolRefillEnabled")
  })

  it("sắp kết quả theo sortOrder", () => {
    const results = filterConfigRecords(RECORDS, "bucket")
    expect(results.map((item) => item.record.sortOrder)).toEqual([1000, 2000])
  })
})
