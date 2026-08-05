import { useCallback, useEffect, useState } from "react"
import type { ColumnVisibilityState } from "@tanstack/react-table"

import { COLUMN_VISIBILITY_STORAGE_KEY } from "../constants.ts"

const DEFAULT_VISIBILITY: ColumnVisibilityState = {}

function readStored(): ColumnVisibilityState | undefined {
  try {
    const raw = window.localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return undefined
    return parsed as ColumnVisibilityState
  } catch {
    return undefined
  }
}

/**
 * Cột ẩn/hiện là preference của người dùng, không phải state chia sẻ qua link,
 * nên lưu localStorage thay vì URL. Đọc trong effect (không phải lazy initializer)
 * để render đầu ở client khớp HTML server — tránh hydration mismatch.
 */
export function usePoolColumnVisibility() {
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>(DEFAULT_VISIBILITY)

  useEffect(() => {
    const stored = readStored()
    if (stored) setColumnVisibility(stored)
  }, [])

  const updateVisibility = useCallback((next: ColumnVisibilityState) => {
    setColumnVisibility(next)
    try {
      window.localStorage.setItem(
        COLUMN_VISIBILITY_STORAGE_KEY,
        JSON.stringify(next)
      )
    } catch {
      // localStorage bị chặn (private mode) — chấp nhận mất preference, không chặn UI.
    }
  }, [])

  const resetVisibility = useCallback(() => {
    updateVisibility(DEFAULT_VISIBILITY)
  }, [updateVisibility])

  return {
    columnVisibility,
    setColumnVisibility: updateVisibility,
    resetVisibility,
  }
}
