import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconPlayerPause,
  IconProgress,
} from "@tabler/icons-react"

import type { StatusMeta } from "@/components/common/status-meta.ts"
import { resolveStatusMeta } from "@/components/common/status-meta.ts"

/**
 * `status` trong model orval là `string` chứ không phải union, nên map luôn có
 * nhánh fallback thay vì giả định đã biết hết giá trị.
 */
export const CRON_STATUS_META: Record<string, StatusMeta> = {
  success: { label: "Thành công", variant: "secondary", icon: IconCircleCheck },
  partial_success: {
    label: "Thành công một phần",
    variant: "outline",
    icon: IconAlertTriangle,
  },
  failed: { label: "Thất bại", variant: "destructive", icon: IconCircleX },
  running: { label: "Đang chạy", variant: "outline", icon: IconProgress },
  skipped: { label: "Bỏ qua", variant: "outline", icon: IconPlayerPause },
}

export function getCronStatusMeta(status: string | null | undefined) {
  return resolveStatusMeta(CRON_STATUS_META, status)
}

export const CRON_JOB_LABELS: Record<string, string> = {
  pool_refill: "Bổ sung kho câu hỏi",
  question_gen: "Sinh câu hỏi",
}

export const CRON_TRIGGER_LABELS: Record<string, string> = {
  schedule: "Theo lịch",
  bullmq: "Hàng đợi",
  manual: "Thủ công",
}

export function labelFor(map: Record<string, string>, value: string): string {
  return map[value] ?? value
}

export const CRON_LIMIT_OPTIONS = [20, 50, 100, 200]
export const DEFAULT_CRON_LIMIT = 20

export const ALL_STATUS_VALUE = "all"
export const ALL_STATUS_LABEL = "Tất cả trạng thái"
