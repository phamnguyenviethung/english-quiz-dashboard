import type { ManualRefillScope } from "./types.ts"

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
