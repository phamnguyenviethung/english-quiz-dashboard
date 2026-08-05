import { describe, expect, it } from "vitest"

import { POOL_SORTS, sortToSortingState, sortingStateToSort } from "./sort.ts"

describe("sortToSortingState", () => {
  it("maps every API sort value to a table column", () => {
    for (const sort of POOL_SORTS) {
      expect(sortToSortingState(sort)).toHaveLength(1)
    }
  })

  it("maps direction to desc flag", () => {
    expect(sortToSortingState("created_desc")).toEqual([
      { id: "createdAt", desc: true },
    ])
    expect(sortToSortingState("token_asc")).toEqual([
      { id: "token", desc: false },
    ])
  })
})

describe("sortingStateToSort", () => {
  it("round-trips every API sort value", () => {
    for (const sort of POOL_SORTS) {
      expect(sortingStateToSort(sortToSortingState(sort))).toBe(sort)
    }
  })

  it("falls back to default khi table bỏ sort hoặc sort cột không hỗ trợ", () => {
    expect(sortingStateToSort([])).toBe("id_asc")
    expect(sortingStateToSort([{ id: "model", desc: true }])).toBe("id_asc")
  })
})
