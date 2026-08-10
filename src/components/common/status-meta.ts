import type { Icon } from "@tabler/icons-react"

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral"

/**
 * Tint nhạt (~12-15%) để badge mang nghĩa mà không lấn brand hồng của dashboard.
 * Cùng công thức với ENG_LEVEL_BADGE_CLASS ở features/quiz/constants.ts.
 */
export const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  success:
    "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  info: "bg-sky-500/12 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  warning:
    "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  danger: "bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  neutral: "border-border bg-transparent text-muted-foreground",
}

export interface StatusMeta {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
  icon?: Icon
  /** Bỏ trống thì badge giữ nguyên màu theo `variant`. */
  tone?: StatusTone
}

export const UNKNOWN_STATUS_META: StatusMeta = {
  label: "Không rõ",
  variant: "outline",
}

export function resolveStatusMeta(
  map: Record<string, StatusMeta>,
  key: string | null | undefined
): StatusMeta {
  if (!key) return UNKNOWN_STATUS_META
  return map[key] ?? { ...UNKNOWN_STATUS_META, label: key }
}
