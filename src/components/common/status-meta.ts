import type { Icon } from "@tabler/icons-react"

export interface StatusMeta {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
  icon?: Icon
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
