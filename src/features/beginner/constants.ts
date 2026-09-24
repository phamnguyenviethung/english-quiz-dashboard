import type { EngLevel } from "@/features/quiz/types.ts"

/** Khớp BEGINNER_ENG_LEVELS phía API — nội dung beginner không có B2. */
export const BEGINNER_LEVELS: EngLevel[] = ["A1", "A2", "B1"]

export const BEGINNER_MAX_OPTIONS = 4

export const BEGINNER_READING_TYPE = "daily"

export const AUDIENCE_VALUES = ["all", "standard", "beginner"] as const
export type AudienceValue = (typeof AUDIENCE_VALUES)[number]
export type BucketAudience = Exclude<AudienceValue, "all">

export const AUDIENCE_LABELS: Record<AudienceValue, string> = {
  all: "Tất cả",
  standard: "Thường",
  beginner: "Người mới",
}

/** Filter 3 trạng thái cho list: undefined = tất cả, true = chỉ beginner, false = chỉ thường. */
export function audienceToForBeginner(
  value: AudienceValue
): boolean | undefined {
  return value === "all" ? undefined : value === "beginner"
}

export function forBeginnerToAudience(
  value: boolean | undefined
): AudienceValue {
  return value === undefined ? "all" : value ? "beginner" : "standard"
}

export function toBucketAudience(
  value: AudienceValue
): BucketAudience | undefined {
  return value === "all" ? undefined : value
}

export function parseAudience(value: unknown): AudienceValue | undefined {
  return AUDIENCE_VALUES.find((item) => item === value)
}

export function parseForBeginnerSearch(value: unknown): boolean | undefined {
  if (value === true || value === "true") return true
  if (value === false || value === "false") return false
  return undefined
}

export const BEGINNER_BADGE_CLASS =
  "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"

/** Lý do không thể đánh dấu beginner — trả undefined khi hợp lệ. */
export function getBeginnerIneligibleReason(input: {
  engLevel?: string | null
  optionCount?: number | null
  readingType?: string | null
}): string | undefined {
  if (input.engLevel && !BEGINNER_LEVELS.includes(input.engLevel as EngLevel)) {
    return `Nội dung beginner chỉ có level ${BEGINNER_LEVELS.join(", ")}.`
  }
  if (input.optionCount && input.optionCount > BEGINNER_MAX_OPTIONS) {
    return `Câu beginner tối đa ${BEGINNER_MAX_OPTIONS} đáp án.`
  }
  if (input.readingType && input.readingType !== BEGINNER_READING_TYPE) {
    return "Bài đọc beginner chỉ có loại đời thường (daily)."
  }
  return undefined
}
