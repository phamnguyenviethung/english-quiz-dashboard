// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useTable } from "@tanstack/react-table"

import { PoolColumnVisibilityMenu } from "./pool-column-visibility-menu.tsx"
import { poolColumns, poolTableFeatures } from "./pool-questions-columns.tsx"
import type { PoolQuestion } from "../types.ts"

// Repo chưa có vitest setup file nên phải tự cleanup, nếu không DOM của test
// trước còn lại và query của test sau bắt nhầm phần tử.
afterEach(cleanup)

const EMPTY_ROWS: PoolQuestion[] = []

function Harness() {
  const table = useTable({
    features: poolTableFeatures,
    columns: poolColumns,
    data: EMPTY_ROWS,
    manualSorting: true,
  })
  return <PoolColumnVisibilityMenu table={table} onReset={vi.fn()} />
}

describe("PoolColumnVisibilityMenu", () => {
  // Regression: DropdownMenuLabel render ra base-ui Menu.GroupLabel, part này throw
  // nếu không nằm trong Menu.Group. Chỉ nổ lúc mở menu vì Portal chưa render gì
  // trước đó — nên phải click thật mới bắt được.
  it("mở menu không throw và liệt kê đủ cột ẩn được", () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole("button", { name: /Cột/ }))

    expect(screen.getByText("Hiện cột")).toBeTruthy()
    expect(screen.getByText("Tạo lúc")).toBeTruthy()
    expect(screen.getByText("Hiện lại tất cả")).toBeTruthy()
  })
})
