import { describe, expect, it } from "vitest"

import type { ConfigDraft, ConfigRecord } from "../types.ts"
import { validateConfigGroups } from "./validate-config-group.ts"

function numRecord(path: string, value: number): ConfigRecord {
  return {
    recordKey: `question_pool.${path}`,
    namespace: "question_pool",
    path,
    category: "questions",
    label: path,
    sortOrder: 1000,
    recordType: "num",
    value,
    defaultValue: value,
    validation: { type: "num", integer: true, min: 1 },
    uiSchema: { type: "num", integer: true, min: 1 },
  } as unknown as ConfigRecord
}

function arrRecord(
  recordKey: string,
  namespace: string,
  value: unknown
): ConfigRecord {
  return {
    recordKey,
    namespace,
    path: "items",
    category: "questions",
    label: recordKey,
    sortOrder: 1050,
    recordType: "arr",
    value,
    defaultValue: value,
    validation: {},
    uiSchema: {},
  } as unknown as ConfigRecord
}

const MANUAL = [
  numRecord("manualFillMinCount", 1),
  numRecord("manualFillDefaultCount", 3),
  numRecord("manualFillMaxCount", 20),
]

const DEFAULT_KEY = "question_pool.manualFillDefaultCount"

describe("validateConfigGroups · manualFill", () => {
  it("không báo lỗi khi min <= default <= max", () => {
    expect(validateConfigGroups(MANUAL, {})).toEqual({})
  })

  it("báo lỗi khi default nhỏ hơn min", () => {
    const drafts: Record<string, ConfigDraft> = {
      "question_pool.manualFillMinCount": "5",
    }
    expect(validateConfigGroups(MANUAL, drafts)[DEFAULT_KEY]).toContain(
      "tối thiểu (5)"
    )
  })

  it("báo lỗi khi default lớn hơn max", () => {
    const drafts: Record<string, ConfigDraft> = { [DEFAULT_KEY]: "50" }
    expect(validateConfigGroups(MANUAL, drafts)[DEFAULT_KEY]).toContain(
      "tối đa (20)"
    )
  })

  it("hết lỗi khi sửa cả min và default cùng lúc", () => {
    const drafts: Record<string, ConfigDraft> = {
      "question_pool.manualFillMinCount": "5",
      [DEFAULT_KEY]: "10",
    }
    expect(validateConfigGroups(MANUAL, drafts)).toEqual({})
  })

  it("bỏ qua check chéo khi field đang có lỗi riêng, tránh báo lỗi chồng", () => {
    const drafts: Record<string, ConfigDraft> = {
      "question_pool.manualFillMinCount": "",
    }
    expect(validateConfigGroups(MANUAL, drafts)).toEqual({})
  })
})

describe("validateConfigGroups · quiz_distribution", () => {
  const key = "quiz_distribution.items"

  it("chấp nhận khi có ít nhất một loại bật với trọng số > 0", () => {
    const record = arrRecord(key, "quiz_distribution", [
      { quizType: "vocab", weight: 10, enabled: true },
    ])
    expect(validateConfigGroups([record], {})).toEqual({})
  })

  it("báo lỗi khi tắt hết", () => {
    const record = arrRecord(key, "quiz_distribution", [
      { quizType: "vocab", weight: 10, enabled: false },
    ])
    expect(validateConfigGroups([record], {})[key]).toContain("đang bật")
  })

  it("báo lỗi khi mọi loại đang bật đều có trọng số 0", () => {
    const record = arrRecord(key, "quiz_distribution", [
      { quizType: "vocab", weight: 0, enabled: true },
    ])
    expect(validateConfigGroups([record], {})[key]).toContain("lớn hơn 0")
  })

  it("báo lỗi khi danh sách rỗng", () => {
    const record = arrRecord(key, "quiz_distribution", [])
    expect(validateConfigGroups([record], {})[key]).toContain("ít nhất một")
  })
})

describe("validateConfigGroups · beginner_quiz_types", () => {
  const key = "beginner_quiz_types.items"

  it("chấp nhận kể cả khi tắt hết loại cho người mới", () => {
    const record = arrRecord(key, "beginner_quiz_types", [
      { quizType: "vocab", enabled: false },
      { quizType: "idiom", enabled: false },
    ])
    expect(validateConfigGroups([record], {})).toEqual({})
  })

  it("báo lỗi khi một loại câu bị khai hai lần", () => {
    const record = arrRecord(key, "beginner_quiz_types", [
      { quizType: "vocab", enabled: true },
      { quizType: "vocab", enabled: false },
    ])
    expect(validateConfigGroups([record], {})[key]).toContain("một lần")
  })
})

describe("validateConfigGroups · lịch cron", () => {
  const key = "pool_refill_schedule.items"

  it("chấp nhận lịch hợp lệ", () => {
    const record = arrRecord(key, "pool_refill_schedule", [
      { name: "morning", cron: "0 5 * * *" },
      { name: "evening", cron: "0 20 * * *" },
    ])
    expect(validateConfigGroups([record], {})).toEqual({})
  })

  it("báo lỗi khi trùng tên scheduler", () => {
    const record = arrRecord(key, "pool_refill_schedule", [
      { name: "morning", cron: "0 5 * * *" },
      { name: "morning", cron: "0 20 * * *" },
    ])
    expect(validateConfigGroups([record], {})[key]).toContain("trùng nhau")
  })

  it("báo đúng số dòng khi thiếu tên", () => {
    const record = arrRecord(key, "pool_refill_schedule", [
      { name: "morning", cron: "0 5 * * *" },
      { name: "  ", cron: "0 20 * * *" },
    ])
    expect(validateConfigGroups([record], {})[key]).toContain("Dòng 2")
  })

  it("báo lỗi khi thiếu cron expression", () => {
    const record = arrRecord(key, "pool_refill_schedule", [
      { name: "morning", cron: "" },
    ])
    expect(validateConfigGroups([record], {})[key]).toContain("cron expression")
  })
})
