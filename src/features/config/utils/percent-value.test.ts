import { describe, expect, it } from "vitest"

import {
  fromPercentDisplay,
  scalePercentBound,
  toPercentDisplay,
} from "./percent-value.ts"

describe("toPercentDisplay", () => {
  it("đổi ratio sang phần trăm", () => {
    expect(toPercentDisplay("0.5")).toBe("50")
    expect(toPercentDisplay("0.65")).toBe("65")
    expect(toPercentDisplay("1")).toBe("100")
    expect(toPercentDisplay("0")).toBe("0")
  })

  it("khử sai số dấu phẩy động", () => {
    // 0.29 * 100 === 28.999999999999996 nếu không làm tròn.
    expect(toPercentDisplay("0.29")).toBe("29")
    expect(toPercentDisplay("0.07")).toBe("7")
  })

  it("giữ nguyên chuỗi rỗng để người dùng xoá trắng được ô nhập", () => {
    expect(toPercentDisplay("")).toBe("")
    expect(toPercentDisplay("  ")).toBe("  ")
  })

  it("giữ nguyên giá trị không phải số", () => {
    expect(toPercentDisplay("abc")).toBe("abc")
  })
})

describe("fromPercentDisplay", () => {
  it("đổi phần trăm về ratio", () => {
    expect(fromPercentDisplay("50")).toBe("0.5")
    expect(fromPercentDisplay("65")).toBe("0.65")
    expect(fromPercentDisplay("100")).toBe("1")
    expect(fromPercentDisplay("0")).toBe("0")
  })

  it("giữ nguyên chuỗi rỗng", () => {
    expect(fromPercentDisplay("")).toBe("")
  })

  it("round-trip không đổi giá trị", () => {
    for (const ratio of ["0", "0.07", "0.29", "0.5", "0.65", "1"]) {
      expect(fromPercentDisplay(toPercentDisplay(ratio))).toBe(ratio)
    }
  })
})

describe("scalePercentBound", () => {
  it("scale min/max của schema sang thang phần trăm", () => {
    expect(scalePercentBound(0)).toBe(0)
    expect(scalePercentBound(1)).toBe(100)
  })

  it("giữ undefined khi schema không khai bound", () => {
    expect(scalePercentBound(undefined)).toBeUndefined()
  })
})
