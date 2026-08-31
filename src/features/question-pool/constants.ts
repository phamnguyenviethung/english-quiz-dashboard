import type { ManualRefillScope, SiblingRefillScope } from "./types.ts"

// Nhãn filter đã nằm trong trigger của pill ("Cấp độ: Tất cả"), nên giá trị
// hiển thị chỉ cần "Tất cả" — nhắc lại tên filter ở đây là thừa.
const ALL_LABEL = "Tất cả"

export const ALL_TOPICS_VALUE = "all"
export const ALL_TOPICS_LABEL = ALL_LABEL

/** Bucket không gắn topic là bucket riêng ở API (`withoutTopic=true`), không phải "tất cả". */
export const NO_TOPIC_VALUE = "none"
export const NO_TOPIC_LABEL = "Không có chủ đề"
/** Bản rút gọn cho pill filter — bảng và detail sheet vẫn dùng NO_TOPIC_LABEL. */
export const NO_TOPIC_FILTER_LABEL = "Không có"

export const ALL_LEVELS_VALUE = "all"
export const ALL_LEVELS_LABEL = ALL_LABEL

export const ALL_QUIZ_TYPES_VALUE = "all"
export const ALL_QUIZ_TYPES_LABEL = ALL_LABEL

export const ALL_MODELS_VALUE = "all"
export const ALL_MODELS_LABEL = ALL_LABEL

export const ALL_OPTION_COUNTS_VALUE = "all"
export const ALL_OPTION_COUNTS_LABEL = ALL_LABEL

/** Spec chung cho 6 pill filter — giữ chúng cùng cỡ và cùng bo góc. */
export const FILTER_PILL = "h-9 w-auto max-w-64 gap-1.5 rounded-3xl"
export const FILTER_PILL_ACTIVE =
  "border-border bg-secondary text-secondary-foreground"
/** Nhãn trong pill: bám theo màu chữ nên đạt AA ở cả nền mặc định lẫn bg-secondary. */
export const FILTER_PILL_LABEL = "text-foreground/60"

export const QUESTIONS_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [20, 50, 100]

/**
 * Loại câu hỗ trợ sinh "câu tương tự" (sibling). Phải khớp SIBLING_SUPPORTED_QUIZ_TYPES
 * ở backend (`questionTypes.ts`). Chỉ dùng để bật/tắt nút — submit vẫn được backend chặn
 * lại (400) nếu lệch.
 */
export const SIBLING_SUPPORTED_QUIZ_TYPES = [
  "vocab",
  "phrase",
  "idiom",
  "slang",
  "synonym",
  "fillblank",
  "conversation",
  "description",
  "verb-use-match",
] as const

export const SIBLING_COUNT_OPTIONS = [1, 2, 3, 5] as const
export const SIBLING_DEFAULT_COUNT = 3
export const SIBLING_NOTE_MAX = 1000

/** Mặc định cho tab bulk khi ô để trống — backend vẫn lấy từ config nếu không gửi. */
export const SIBLING_DEFAULT_SOURCES_PER_BUCKET = 2

export function isSiblingSupportedQuizType(quizType: string): boolean {
  return (SIBLING_SUPPORTED_QUIZ_TYPES as readonly string[]).includes(quizType)
}

export const SIBLING_REFILL_SCOPE_META: Record<
  SiblingRefillScope,
  { label: string; description: string }
> = {
  deficient: {
    label: "Chỉ bucket còn thiếu",
    description:
      "Chỉ bù câu tương tự cho bucket chưa đạt số câu tối đa. Bucket đã đầy được bỏ qua.",
  },
  all: {
    label: "Toàn bộ bucket",
    description:
      "Ép sinh câu tương tự cho mọi bucket khớp filter, kể cả bucket đã đầy.",
  },
}

/** Ngưỡng bật cảnh báo chi phí ở tab sinh câu tương tự (theo số câu sẽ thêm). */
export const SIBLING_REFILL_COST_WARNING = 150

export const COLUMN_VISIBILITY_STORAGE_KEY = "question-pool:columns"

export const MANUAL_REFILL_SCOPE_META: Record<
  ManualRefillScope,
  { label: string; description: string }
> = {
  deficient: {
    label: "Chỉ bucket còn thiếu",
    description:
      "Chỉ bù cho bucket chưa đạt số câu tối đa. Bucket đã đầy được bỏ qua.",
  },
  all: {
    label: "Toàn bộ bucket",
    description:
      "Ép sinh thêm câu cho mọi bucket, kể cả bucket đã đầy. Bỏ qua giới hạn chi phí mỗi lần chạy.",
  },
}

/**
 * Ngưỡng bật cảnh báo chi phí trong dialog refill. Preview đã cho biết số câu thật
 * nên cảnh báo bám theo con số đó, không bám theo scope như bản cũ.
 */
export const REFILL_COST_WARNING_QUESTIONS = 200
