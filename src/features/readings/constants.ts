import { GetAdminReadingsType } from "@/apis/model"

import type { ReadingRefillScope, ReadingType } from "./types.ts"

export const READING_TYPES: ReadingType[] = [
  GetAdminReadingsType.daily,
  GetAdminReadingsType.academic,
]

export const READING_TYPE_META: Record<
  ReadingType,
  { label: string; description: string }
> = {
  daily: {
    label: "Đời thường",
    description: "Narrative, micro-reading tình huống đời thường.",
  },
  academic: {
    label: "Học thuật",
    description:
      "Expository, văn phong trang trọng, khuyến khích từ vựng học thuật.",
  },
}

/** API trả `type` dạng `string`, nên tra cứu phải có fallback. */
export function getReadingTypeLabel(type: string): string {
  return Object.hasOwn(READING_TYPE_META, type)
    ? READING_TYPE_META[type as ReadingType].label
    : type
}

/**
 * Band độ dài dùng chung cho mọi CEFR level — phải khớp READING_WORD_BAND ở backend
 * (src/core/services/english/prompt/reading-passage-prompt.ts). Dùng để gắn nhãn
 * "đúng band / lệch band" cho từng bài trong bảng.
 */
export const READING_WORD_BAND = { min: 150, max: 220 } as const

export function isWordCountInBand(wordCount: number) {
  return (
    wordCount >= READING_WORD_BAND.min && wordCount <= READING_WORD_BAND.max
  )
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

export const ALL_LEVELS_VALUE = "all"
export const ALL_LEVELS_LABEL = "Tất cả"

export const ALL_TOPICS_VALUE = "all"
export const ALL_TOPICS_LABEL = "Tất cả"

export const ALL_TYPES_VALUE = "all"
export const ALL_TYPES_LABEL = "Tất cả"

export const ALL_MODELS_VALUE = "all"
export const ALL_MODELS_LABEL = "Tất cả"

export const ALL_STATUS_VALUE = "all"
export const ALL_STATUS_LABEL = "Tất cả"

export const FILTER_PILL = "h-9 w-auto max-w-64 gap-1.5 rounded-3xl"
export const FILTER_PILL_ACTIVE =
  "border-border bg-secondary text-secondary-foreground"
export const FILTER_PILL_LABEL = "text-foreground/60"

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

/** Bài đọc tốn nhiều token hơn 1 câu quiz nên ngưỡng cảnh báo thấp hơn bên pool. */
export const REFILL_COST_WARNING_PASSAGES = 60
