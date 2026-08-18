import type { EngLevel } from "@/features/quiz/types.ts"

import type { ReadingQuestionRefillScope } from "./types.ts"

/**
 * 19 quiz type của câu hỏi đọc hiểu. API trả `quizType` dạng `string` (response
 * schema khai t.String()) nên không có generated enum — union này phải tự khớp với
 * READING_QUESTION_TYPES ở backend (src/core/services/english/readingQuestionTypes.ts).
 */
export const READING_QUESTION_TYPES = [
  "detail",
  "main_idea",
  "reason",
  "cause_effect",
  "sequence",
  "inference",
  "vocabulary_context",
  "purpose",
  "result",
  "true_false",
  "negative_detail",
  "matching",
  "best_title",
  "paraphrase",
  "reference",
  "prediction",
  "attitude",
  "specific_function",
  "comparison",
] as const

export type ReadingQuestionType = (typeof READING_QUESTION_TYPES)[number]

export const READING_QUESTION_TYPE_LABELS: Record<ReadingQuestionType, string> =
  {
    detail: "Chi tiết",
    main_idea: "Ý chính",
    reason: "Lý do",
    cause_effect: "Nhân quả",
    sequence: "Trình tự",
    inference: "Suy luận",
    vocabulary_context: "Từ vựng theo ngữ cảnh",
    purpose: "Mục đích",
    result: "Kết quả",
    true_false: "Đúng/Sai",
    negative_detail: "Chi tiết phủ định",
    matching: "Ghép thông tin",
    best_title: "Tiêu đề phù hợp",
    paraphrase: "Diễn đạt lại",
    reference: "Đại từ thay thế",
    prediction: "Dự đoán",
    attitude: "Thái độ",
    specific_function: "Vai trò chi tiết",
    comparison: "So sánh",
  }

/** Allow-list theo level, khớp CEFR_ALLOWED_QUESTION_TYPES ở backend. */
export const CEFR_ALLOWED_QUESTION_TYPES: Record<
  EngLevel,
  readonly ReadingQuestionType[]
> = {
  A1: ["detail", "reason", "sequence", "result", "vocabulary_context"],
  A2: [
    "detail",
    "reason",
    "result",
    "sequence",
    "vocabulary_context",
    "main_idea",
  ],
  B1: [
    "detail",
    "reason",
    "cause_effect",
    "sequence",
    "main_idea",
    "vocabulary_context",
    "inference",
    "purpose",
  ],
  B2: [
    "detail",
    "main_idea",
    "purpose",
    "cause_effect",
    "inference",
    "vocabulary_context",
    "comparison",
    "attitude",
    "specific_function",
    "prediction",
  ],
}

const AUTO_GENERATABLE_TYPES = new Set<string>(
  Object.values(CEFR_ALLOWED_QUESTION_TYPES).flat()
)

export function isReadingQuestionType(
  value: string
): value is ReadingQuestionType {
  return (READING_QUESTION_TYPES as readonly string[]).includes(value)
}

export function getReadingQuestionTypeLabel(value: string): string {
  return isReadingQuestionType(value)
    ? READING_QUESTION_TYPE_LABELS[value]
    : value
}

/**
 * 6 type (true_false, negative_detail, matching, best_title, paraphrase,
 * reference) có trong enum nhưng không nằm trong allow-list của level nào, nên chỉ
 * xuất hiện khi admin sửa tay. Đây là khác biệt đáng hiển thị, khác với loại câu hỏi
 * vốn không phải thang đo nên không tô màu.
 */
export function isAutoGeneratableType(value: string): boolean {
  return AUTO_GENERATABLE_TYPES.has(value)
}

export const READING_QUESTIONS_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [20, 50, 100]

export const DEFAULT_READING_QUESTION_SORT = "id_desc" as const

export const READING_QUESTION_SORTS = [
  "id_asc",
  "id_desc",
  "created_asc",
  "created_desc",
  "passage_asc",
  "passage_desc",
] as const

export const OPTIONS_PER_QUESTION = 4

export const ALL_VALUE = "all"
export const ALL_LABEL = "Tất cả"

export const ACTIVE_VALUE = "active"
export const INACTIVE_VALUE = "inactive"

export const READING_QUESTION_STATUS_META = {
  [ACTIVE_VALUE]: { label: "Đang bật" },
  [INACTIVE_VALUE]: { label: "Đã tắt" },
} as const

export const READING_QUESTION_REFILL_SCOPE_META: Record<
  ReadingQuestionRefillScope,
  { label: string; description: string }
> = {
  deficient: {
    label: "Chỉ bài còn thiếu",
    description:
      "Chỉ sinh cho bài chưa đủ số câu mục tiêu. Bài đã đủ được bỏ qua.",
  },
  all: {
    label: "Toàn bộ bài",
    description:
      "Ép sinh cho mọi bài khớp filter, kể cả bài đã đủ câu. Bỏ qua giới hạn chi phí mỗi lần chạy.",
  },
}

/** Mỗi bài ăn 3 câu, một lượt cron mặc định là 60 câu (~20 bài). */
export const REFILL_COST_WARNING_QUESTIONS = 90
