import { describe, expect, it } from "vitest"

import type { ConfigRecord } from "../types.ts"
import {
  canUseRowEditor,
  parseConfigFieldSchema,
  resolveRecordSchema,
} from "./parse-config-schema.ts"

function makeRecord(patch: Partial<ConfigRecord>): ConfigRecord {
  return {
    id: 1,
    recordKey: "pool.maxPerBucket",
    namespace: "english",
    path: "question_pool.maxPerBucket",
    category: "pool",
    label: "Số câu tối đa mỗi bucket",
    description: null,
    recordTypeId: 1,
    valueText: null,
    valueNumber: 50,
    valueBoolean: null,
    valueJson: null,
    defaultText: null,
    defaultNumber: 50,
    defaultBoolean: null,
    defaultJson: null,
    validation: null,
    uiSchema: null,
    sortOrder: 0,
    createdAt: null,
    updatedAt: null,
    recordType: "num",
    value: 50,
    defaultValue: 50,
    ...patch,
  }
}

describe("parseConfigFieldSchema", () => {
  it("trả object rỗng với đầu vào không phải object", () => {
    expect(parseConfigFieldSchema(null)).toEqual({})
    expect(parseConfigFieldSchema("min: 1")).toEqual({})
    expect(parseConfigFieldSchema([1, 2])).toEqual({})
    expect(parseConfigFieldSchema(undefined)).toEqual({})
  })

  it("đọc quy ước rút gọn", () => {
    const schema = parseConfigFieldSchema({
      type: "num",
      label: "Nhãn",
      min: 1,
      max: 100,
      step: 5,
      integer: true,
    })
    expect(schema).toMatchObject({
      type: "num",
      label: "Nhãn",
      min: 1,
      max: 100,
      step: 5,
      integer: true,
    })
  })

  it("đọc cả quy ước kiểu JSON-Schema", () => {
    const schema = parseConfigFieldSchema({
      minimum: 2,
      maximum: 8,
      multipleOf: 2,
      enum: ["a", "b"],
      title: "Tiêu đề",
    })
    expect(schema).toMatchObject({
      min: 2,
      max: 8,
      step: 2,
      options: ["a", "b"],
      label: "Tiêu đề",
    })
  })

  it("bỏ qua field sai kiểu thay vì nhận bừa", () => {
    const schema = parseConfigFieldSchema({
      type: "khong-ton-tai",
      min: "1",
      options: ["ok", 5],
      integer: "true",
    })
    expect(schema.type).toBeUndefined()
    expect(schema.min).toBeUndefined()
    expect(schema.options).toBeUndefined()
    expect(schema.integer).toBeUndefined()
  })

  it("parse itemFields lồng nhau và bỏ entry rỗng", () => {
    const schema = parseConfigFieldSchema({
      type: "arr",
      itemFields: {
        quizType: { type: "str", options: ["vocab", "idiom"] },
        weight: { type: "num", min: 0, integer: true },
        enabled: { type: "boolean" },
        rac: "khong-phai-object",
      },
    })

    expect(Object.keys(schema.itemFields ?? {})).toEqual([
      "quizType",
      "weight",
      "enabled",
    ])
    expect(schema.itemFields?.quizType.options).toEqual(["vocab", "idiom"])
  })

  it("không nhận itemFields khi vượt quá độ sâu cho phép", () => {
    const schema = parseConfigFieldSchema({
      itemFields: {
        a: { itemFields: { b: { itemFields: { c: { type: "str" } } } } },
      },
    })
    expect(schema.itemFields?.a.itemFields?.b.itemFields).toBeUndefined()
  })
})

describe("resolveRecordSchema", () => {
  it("uiSchema ghi đè validation, field undefined không xoá field đã có", () => {
    const schema = resolveRecordSchema(
      makeRecord({
        validation: { min: 1, max: 10, integer: true },
        uiSchema: { max: 20, placeholder: "nhập số" },
      })
    )
    expect(schema).toMatchObject({
      min: 1,
      max: 20,
      integer: true,
      placeholder: "nhập số",
    })
  })

  it("record không có schema vẫn trả object dùng được", () => {
    expect(resolveRecordSchema(makeRecord({}))).toEqual({
      type: undefined,
      label: undefined,
      description: undefined,
      min: undefined,
      max: undefined,
      step: undefined,
      integer: undefined,
      multiline: undefined,
      placeholder: undefined,
      options: undefined,
    })
  })
})

describe("canUseRowEditor", () => {
  const itemFields = { weight: { type: "num" as const } }

  it("chỉ bật khi có itemFields và giá trị là mảng object", () => {
    expect(canUseRowEditor({ itemFields }, [{ weight: 1 }])).toBe(true)
    expect(canUseRowEditor({ itemFields }, [])).toBe(true)
  })

  it("tắt khi thiếu itemFields hoặc giá trị sai shape", () => {
    expect(canUseRowEditor({}, [{ weight: 1 }])).toBe(false)
    expect(canUseRowEditor({ itemFields }, "not-array")).toBe(false)
    expect(canUseRowEditor({ itemFields }, [1, 2])).toBe(false)
    expect(canUseRowEditor({ itemFields }, [null])).toBe(false)
  })
})
