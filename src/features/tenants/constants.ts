import type { StatusMeta } from "@/components/common/status-meta.ts"

// Mirror thủ công của `src/api/common/scopes.ts` bên API — backend không expose
// endpoint list scope, nên thêm scope mới ở đó phải cập nhật cả file này.
export const SCOPE_VALUES = [
  "quiz:read",
  "pool:fill",
  "config:read",
  "config:write",
  "topic:write",
  "cron:read",
] as const

export type Scope = (typeof SCOPE_VALUES)[number]

export interface ScopeOption {
  value: Scope
  label: string
  description: string
}

export const SCOPE_OPTIONS: ScopeOption[] = [
  {
    value: "quiz:read",
    label: "Đọc quiz",
    description: "Sinh câu hỏi, lấy câu từ pool, đọc danh sách chủ đề và dạng quiz.",
  },
  {
    value: "pool:fill",
    label: "Nạp kho câu hỏi",
    description: "Đẩy job sinh thêm câu hỏi vào pool.",
  },
  {
    value: "config:read",
    label: "Đọc cấu hình",
    description: "Xem cấu hình runtime của service.",
  },
  {
    value: "config:write",
    label: "Sửa cấu hình",
    description: "Đổi giá trị cấu hình và đặt lại về mặc định.",
  },
  {
    value: "topic:write",
    label: "Tạo chủ đề",
    description: "Thêm chủ đề mới vào hệ thống.",
  },
  {
    value: "cron:read",
    label: "Đọc lịch sử cron",
    description: "Xem các lần chạy job nền và chi tiết từng bucket.",
  },
]

const SCOPE_LABELS = new Map(
  SCOPE_OPTIONS.map((option) => [option.value as string, option.label])
)

/** Tenant cũ có thể chứa scope không còn trong danh sách, nên tra cứu phải có fallback. */
export function getScopeLabel(scope: string): string {
  return SCOPE_LABELS.get(scope) ?? scope
}

export function isKnownScope(scope: string): boolean {
  return SCOPE_LABELS.has(scope)
}

export const TENANT_STATUS_META: Record<"active" | "inactive", StatusMeta> = {
  active: { label: "Đang hoạt động", variant: "secondary" },
  inactive: { label: "Đã tắt", variant: "outline" },
}

export const API_KEY_STATUS_META: Record<"active" | "revoked", StatusMeta> = {
  active: { label: "Đang dùng", variant: "secondary" },
  revoked: { label: "Đã thu hồi", variant: "outline" },
}

/** Số badge scope hiển thị trong bảng trước khi gộp thành `+N`. */
export const SCOPE_BADGE_LIMIT = 3
