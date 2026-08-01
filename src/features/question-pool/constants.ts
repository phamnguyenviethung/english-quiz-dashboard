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

/** Bucket không gắn topic là bucket riêng ở API (`withoutTopic=true`), không phải "tất cả". */
export const NO_TOPIC_VALUE = "none"
export const NO_TOPIC_LABEL = "Không có chủ đề"

export const ALL_LEVELS_VALUE = "all"
export const ALL_LEVELS_LABEL = "Tất cả cấp độ"

export const ALL_QUIZ_TYPES_VALUE = "all"
export const ALL_QUIZ_TYPES_LABEL = "Tất cả loại câu"

export const QUESTIONS_PAGE_SIZE = 20

export const PENDING_FILL_POLL_MS = 15_000
export const PENDING_FILL_MAX_MS = 4 * 60_000
