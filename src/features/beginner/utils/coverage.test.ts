import { describe, expect, it } from "vitest"

import {
  buildTopicCoverage,
  getCoverageTone,
  getFullBucketRatio,
} from "./coverage.ts"

describe("buildTopicCoverage", () => {
  it("gộp tồn kho các loại câu của cùng topic + level, mỗi bucket tối đa bằng target", () => {
    const [row] = buildTopicCoverage({
      topicIds: [7],
      poolBuckets: [
        { topicId: 7, engLevel: "A1", currentCount: 3 },
        { topicId: 7, engLevel: "A1", currentCount: 5 },
        { topicId: 7, engLevel: "A2", currentCount: 1 },
      ],
      readingBuckets: [{ topicId: 7, cefrLevel: "B1", currentCount: 2 }],
      poolMaxPerBucket: 3,
      readingMaxPerBucket: 3,
    })

    expect(row.pool.A1).toEqual({ current: 6, target: 6 })
    expect(row.pool.A2).toEqual({ current: 1, target: 3 })
    expect(row.pool.B1).toEqual({ current: 0, target: 0 })
    expect(row.reading.B1).toEqual({ current: 2, target: 3 })
  })

  it("bỏ qua bucket B2, bucket không topic và topic không nằm trong danh sách beginner", () => {
    const [row] = buildTopicCoverage({
      topicIds: [7],
      poolBuckets: [
        { topicId: 7, engLevel: "B2", currentCount: 3 },
        { topicId: null, engLevel: "A1", currentCount: 3 },
        { topicId: 99, engLevel: "A1", currentCount: 3 },
      ],
      readingBuckets: [],
      poolMaxPerBucket: 3,
      readingMaxPerBucket: 3,
    })

    expect(row.pool.A1).toEqual({ current: 0, target: 0 })
    expect(row.pool.B2).toEqual({ current: 0, target: 0 })
  })

  it("topic beginner chưa có bucket nào vẫn có dòng để admin thấy đang trống", () => {
    const rows = buildTopicCoverage({
      topicIds: [1, 2],
      poolBuckets: [],
      readingBuckets: [],
      poolMaxPerBucket: 3,
      readingMaxPerBucket: 3,
    })
    expect(rows.map((row) => row.topicId)).toEqual([1, 2])
  })
})

describe("getCoverageTone", () => {
  it("phân loại theo tỉ lệ tồn kho so với target", () => {
    expect(getCoverageTone({ current: 6, target: 6 })).toBe("full")
    expect(getCoverageTone({ current: 3, target: 6 })).toBe("partial")
    expect(getCoverageTone({ current: 1, target: 6 })).toBe("low")
    expect(getCoverageTone({ current: 0, target: 0 })).toBe("empty")
  })
})

describe("getFullBucketRatio", () => {
  it("tính tỉ lệ bucket đã đủ", () => {
    expect(
      getFullBucketRatio(
        [
          { topicId: 1, currentCount: 3 },
          { topicId: 1, currentCount: 1 },
        ],
        3
      )
    ).toBe(0.5)
  })

  it("không có bucket nào trả null thay vì 0%", () => {
    expect(getFullBucketRatio([], 3)).toBeNull()
  })
})
