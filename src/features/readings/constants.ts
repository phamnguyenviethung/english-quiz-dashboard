import type { EngLevel } from "@/features/quiz/types.ts"

import type { ReadingRefillScope } from "./types.ts"

export interface WordBand {
  min: number
  max: number
}

/**
 * Band độ dài theo CEFR — phải khớp CEFR_WORD_BANDS ở backend
 * (src/core/services/english/prompt/reading-passage-prompt.ts). Dùng để gắn nhãn
 * "đúng band / lệch band" cho từng bài trong bảng.
 */
export const CEFR_WORD_BANDS: Record<EngLevel, WordBand> = {
  A1: { min: 70, max: 100 },
  A2: { min: 90, max: 130 },
  B1: { min: 120, max: 170 },
  B2: { min: 140, max: 190 },
}

/** `cefrLevel` từ API là string tự do nên band có thể không tra được — trả undefined. */
export function getWordBand(cefrLevel: string): WordBand | undefined {
  return (CEFR_WORD_BANDS as Record<string, WordBand | undefined>)[cefrLevel]
}

export function isWordCountInBand(cefrLevel: string, wordCount: number) {
  const band = getWordBand(cefrLevel)
  if (!band) return true
  return wordCount >= band.min && wordCount <= band.max
}

export const READINGS_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [20, 50, 100]

export const DEFAULT_READING_SORT = "id_desc" as const

export const READING_SORTS = [
  "id_asc",
  "id_desc",
  "created_asc",
  "created_desc",
  "words_asc",
  "words_desc",
] as const

export const ALL_VALUE = "all"
export const ALL_LABEL = "Tất cả"

export const ACTIVE_VALUE = "active"
export const INACTIVE_VALUE = "inactive"

export const READING_STATUS_META = {
  [ACTIVE_VALUE]: { label: "Đang bật" },
  [INACTIVE_VALUE]: { label: "Đã tắt" },
} as const

export const READING_REFILL_SCOPE_META: Record<
  ReadingRefillScope,
  { label: string; description: string }
> = {
  deficient: {
    label: "Chỉ bucket còn thiếu",
    description:
      "Chỉ bù cho bucket chưa đạt số bài tối đa. Bucket đã đủ được bỏ qua.",
  },
  all: {
    label: "Toàn bộ bucket",
    description:
      "Ép sinh thêm bài cho mọi bucket, kể cả bucket đã đủ. Bỏ qua giới hạn chi phí mỗi lần chạy.",
  },
}

export const BUCKET_FILTER_ALL_HINT = "Bỏ trống = tất cả"

/** Bài đọc tốn nhiều token hơn 1 câu quiz nên ngưỡng cảnh báo thấp hơn bên pool. */
export const REFILL_COST_WARNING_PASSAGES = 60

export const BUCKET_PREVIEW_DEBOUNCE_MS = 350
