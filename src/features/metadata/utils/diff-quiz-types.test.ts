import { describe, expect, it } from "vitest"

import { diffQuizTypes } from "./diff-quiz-types.ts"

describe("diffQuizTypes", () => {
  it("báo in-sync khi hai danh sách trùng nhau bất kể thứ tự", () => {
    expect(diffQuizTypes(["vocab", "idiom"], ["idiom", "vocab"])).toEqual({
      inSync: true,
      missingLocally: [],
      missingRemotely: [],
    })
  })

  it("phát hiện quizType mới từ API", () => {
    const diff = diffQuizTypes(["vocab", "haiku"], ["vocab"])
    expect(diff.inSync).toBe(false)
    expect(diff.missingLocally).toEqual(["haiku"])
    expect(diff.missingRemotely).toEqual([])
  })

  it("phát hiện quizType dashboard còn khai báo thừa", () => {
    const diff = diffQuizTypes(["vocab"], ["vocab", "slang"])
    expect(diff.inSync).toBe(false)
    expect(diff.missingLocally).toEqual([])
    expect(diff.missingRemotely).toEqual(["slang"])
  })

  it("xử lý được danh sách rỗng ở cả hai phía", () => {
    expect(diffQuizTypes([], []).inSync).toBe(true)
    expect(diffQuizTypes([], ["vocab"]).missingRemotely).toEqual(["vocab"])
    expect(diffQuizTypes(["vocab"], []).missingLocally).toEqual(["vocab"])
  })
})
