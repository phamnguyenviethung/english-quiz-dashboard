import { describe, expect, it } from "vitest"

import type { ConfigRecord, ConfigRecordType } from "../types.ts"
import { fromDraft, isDraftEqual, toDraft } from "./config-value-io.ts"
import { validateConfigValue } from "./validate-config-value.ts"

function makeRecord(
  recordType: ConfigRecordType,
  value: unknown,
  patch: Partial<ConfigRecord> = {}
): ConfigRecord {
  return {
    id: 1,
    recordKey: `test.${recordType}`,
    namespace: "english",
    path: `test.${recordType}`,
    category: "pool",
    label: "Test",
    description: null,
    recordTypeId: 1,
    valueText: null,
    valueNumber: null,
    valueBoolean: null,
    valueJson: null,
    defaultText: null,
    defaultNumber: null,
    defaultBoolean: null,
    defaultJson: null,
    validation: null,
    uiSchema: null,
    sortOrder: 0,
    createdAt: null,
    updatedAt: null,
    recordType,
    value,
    defaultValue: value,
    ...patch,
  }
}

describe("toDraft / fromDraft", () => {
  it("num round-trip qua chuỗi", () => {
    const record = makeRecord("num", 50)
    const draft = toDraft(record, {})
    expect(draft).toBe("50")
    expect(fromDraft(record, draft)).toBe(50)
  })

  it("boolean giữ nguyên kiểu", () => {
    const record = makeRecord("boolean", true)
    expect(toDraft(record, {})).toBe(true)
    expect(fromDraft(record, false)).toBe(false)
  })

  it("arr không có itemFields thì dùng JSON pretty-print", () => {
    const record = makeRecord("arr", [{ a: 1 }])
    const draft = toDraft(record, {})
    expect(typeof draft).toBe("string")
    expect(fromDraft(record, draft)).toEqual([{ a: 1 }])
  })

  it("arr có itemFields thì giữ dạng mảng object và copy từng dòng", () => {
    const rows = [{ quizType: "vocab", weight: 3 }]
    const record = makeRecord("arr", rows)
    const draft = toDraft(record, { itemFields: { weight: { type: "num" } } })

    expect(Array.isArray(draft)).toBe(true)
    expect(draft).toEqual(rows)
    expect((draft as Record<string, unknown>[])[0]).not.toBe(rows[0])
    expect(fromDraft(record, draft)).toEqual(rows)
  })

  it("JSON hỏng trả null thay vì throw", () => {
    const record = makeRecord("obj", {})
    expect(fromDraft(record, "{ khong-phai-json")).toBeNull()
  })
})

describe("isDraftEqual", () => {
  it("so sánh chuỗi và boolean theo giá trị", () => {
    expect(isDraftEqual("50", "50")).toBe(true)
    expect(isDraftEqual("50", "51")).toBe(false)
    expect(isDraftEqual(true, true)).toBe(true)
    expect(isDraftEqual(true, false)).toBe(false)
  })

  it("so sánh mảng object theo nội dung", () => {
    expect(isDraftEqual([{ a: 1 }], [{ a: 1 }])).toBe(true)
    expect(isDraftEqual([{ a: 1 }], [{ a: 2 }])).toBe(false)
  })
})

describe("validateConfigValue", () => {
  it("num: chặn rỗng, không phải số, ngoài biên và không nguyên", () => {
    const record = makeRecord("num", 50)
    const schema = { min: 1, max: 100, integer: true }

    expect(validateConfigValue(record, schema, "")).toContain("để trống")
    expect(validateConfigValue(record, schema, "abc")).toContain("số hợp lệ")
    expect(validateConfigValue(record, schema, "0")).toContain("lớn hơn")
    expect(validateConfigValue(record, schema, "101")).toContain("nhỏ hơn")
    expect(validateConfigValue(record, schema, "1.5")).toContain("số nguyên")
    expect(validateConfigValue(record, schema, "50")).toBeUndefined()
  })

  it("str: kiểm tra enum và độ dài", () => {
    const record = makeRecord("str", "a")
    expect(validateConfigValue(record, { options: ["a", "b"] }, "c")).toContain(
      "một trong"
    )
    expect(
      validateConfigValue(record, { options: ["a", "b"] }, "b")
    ).toBeUndefined()
    expect(validateConfigValue(record, { max: 2 }, "abc")).toContain("tối đa")
  })

  it("arr/obj: bắt JSON hỏng và sai kiểu gốc", () => {
    const arr = makeRecord("arr", [])
    const obj = makeRecord("obj", {})

    expect(validateConfigValue(arr, {}, "{ hong")).toBe("JSON không hợp lệ.")
    expect(validateConfigValue(arr, {}, "")).toContain("để trống")
    expect(validateConfigValue(arr, {}, '{"a":1}')).toContain("mảng JSON")
    expect(validateConfigValue(obj, {}, "[1]")).toContain("object JSON")
    expect(validateConfigValue(arr, {}, "[1,2]")).toBeUndefined()
  })

  it("arr có itemFields: kiểm tra từng ô và chỉ rõ dòng", () => {
    const record = makeRecord("arr", [])
    const schema = {
      itemFields: {
        weight: {
          type: "num" as const,
          min: 0,
          integer: true,
          label: "Trọng số",
        },
      },
    }

    const error = validateConfigValue(record, schema, [
      { weight: 1 },
      { weight: -1 },
    ])
    expect(error).toContain("Dòng 2")
    expect(error).toContain("Trọng số")

    expect(validateConfigValue(record, schema, [{ weight: 0 }])).toBeUndefined()
  })
})
