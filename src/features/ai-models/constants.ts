import type { StatusMeta } from "@/components/common/status-meta.ts"

import type { ModelContext } from "./types.ts"

export const MODEL_STATUS_META: Record<"active" | "inactive", StatusMeta> = {
  active: { label: "Đang hoạt động", variant: "secondary" },
  inactive: { label: "Đã tắt", variant: "outline" },
}

export const MODEL_CONTEXT_LABELS: Record<ModelContext, string> = {
  schedule: "Tự động",
  manual: "Thủ công",
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
