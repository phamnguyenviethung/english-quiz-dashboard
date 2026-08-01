import type { PoolStatus } from "./types.ts"

export const POOL_LOW_THRESHOLD = 20

export function getPoolStatus(count: number): PoolStatus {
  if (count <= 0) return "empty"
  if (count < POOL_LOW_THRESHOLD) return "low"
  return "healthy"
}

export const POOL_STATUS_META: Record<
  PoolStatus,
  { label: string; variant: "destructive" | "outline" | "secondary" }
> = {
  empty: { label: "Empty", variant: "destructive" },
  low: { label: "Low", variant: "outline" },
  healthy: { label: "Healthy", variant: "secondary" },
}

export const ALL_TOPICS_VALUE = "all"
export const ALL_TOPICS_LABEL = "Tất cả chủ đề"

export const PENDING_FILL_POLL_MS = 15_000
export const PENDING_FILL_MAX_MS = 4 * 60_000
