import type { StatusMeta } from "@/components/common/status-meta.ts"

export const MODEL_STATUS_META: Record<"active" | "inactive", StatusMeta> = {
  active: { label: "Đang hoạt động", variant: "secondary" },
  inactive: { label: "Đã tắt", variant: "outline" },
}
