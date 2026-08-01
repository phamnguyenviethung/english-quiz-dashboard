import { IconCircleCheck, IconCircleX } from "@tabler/icons-react"

import type { StatusMeta } from "@/components/common/status-meta.ts"

export const DEFAULT_PAIR_COUNT = 3
export const PAIR_COUNT_MIN = 1
export const PAIR_COUNT_MAX = 20

export const HEALTH_STATUS_META: Record<string, StatusMeta> = {
  ok: {
    label: "Hoạt động bình thường",
    variant: "secondary",
    icon: IconCircleCheck,
  },
  error: { label: "Có sự cố", variant: "destructive", icon: IconCircleX },
}

export const HEALTH_POLL_MS = 30_000

/** File chứa hằng quizType phía UI, hiện trong cảnh báo khi lệch với API. */
export const QUIZ_TYPE_SOURCE_FILE = "src/features/quiz/constants.ts"
