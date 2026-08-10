import type { Icon } from "@tabler/icons-react"
import {
  IconCircleCheck,
  IconCircleOff,
  IconClockBolt,
  IconHandClick,
} from "@tabler/icons-react"

import type { StatusMeta, StatusTone } from "@/components/common/status-meta.ts"

import type { ModelContext } from "./types.ts"

// Model tắt là trạng thái bình thường chứ không phải lỗi, nên dùng tone trung
// tính thay vì đỏ — đỏ để dành cho lỗi thật.
export const MODEL_STATUS_META: Record<"active" | "inactive", StatusMeta> = {
  active: {
    label: "Đang hoạt động",
    variant: "secondary",
    tone: "success",
    icon: IconCircleCheck,
  },
  inactive: {
    label: "Đã tắt",
    variant: "outline",
    tone: "neutral",
    icon: IconCircleOff,
  },
}

/** Mỗi ngữ cảnh một hue riêng để quét bảng là biết model phục vụ đường nào. */
export const MODEL_CONTEXT_META: Record<
  ModelContext,
  { label: string; tone: StatusTone; icon: Icon }
> = {
  schedule: { label: "Tự động", tone: "info", icon: IconClockBolt },
  manual: { label: "Thủ công", tone: "warning", icon: IconHandClick },
}

export const MODEL_CONTEXT_LABELS: Record<ModelContext, string> = {
  schedule: MODEL_CONTEXT_META.schedule.label,
  manual: MODEL_CONTEXT_META.manual.label,
}

export const MODEL_CONTEXT_DESCRIPTIONS: Record<ModelContext, string> = {
  schedule: "Cron bổ sung kho câu hỏi và các lượt sinh tự động khác.",
  manual: "Khi admin bấm bổ sung kho câu hỏi thủ công.",
}

/**
 * `sort` là string tự do ở backend nên giữ nhánh "mặc định" rỗng thay vì ép union.
 * Danh sách theo tài liệu OpenRouter.
 */
export const PROVIDER_SORT_OPTIONS = [
  { value: "price", label: "Giá thấp nhất" },
  { value: "throughput", label: "Thông lượng cao nhất" },
  { value: "latency", label: "Độ trễ thấp nhất" },
]

export const PROVIDER_DATA_COLLECTION_OPTIONS = [
  { value: "allow", label: "Cho phép" },
  { value: "deny", label: "Từ chối" },
]

/** Giá trị rỗng cho Select — base-ui không nhận value="" nên dùng sentinel. */
export const PROVIDER_UNSET_VALUE = "unset"
export const PROVIDER_UNSET_LABEL = "Mặc định (không đặt)"
