import type { StatusMeta } from "@/components/common/status-meta.ts"

export const TENANT_STATUS_META: Record<"active" | "inactive", StatusMeta> = {
  active: { label: "Đang hoạt động", variant: "secondary" },
  inactive: { label: "Đã tắt", variant: "outline" },
}

export const API_KEY_STATUS_META: Record<"active" | "revoked", StatusMeta> = {
  active: { label: "Đang dùng", variant: "secondary" },
  revoked: { label: "Đã thu hồi", variant: "outline" },
}
