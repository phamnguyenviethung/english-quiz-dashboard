import type { Icon } from "@tabler/icons-react"
import {
  IconAdjustmentsAlt,
  IconDatabase,
  IconPlayerPlay,
} from "@tabler/icons-react"

import type { ConfigRecordType } from "./types.ts"

export const CONFIG_CATEGORY_META: Record<
  string,
  { label: string; description: string; icon: Icon }
> = {
  pool: {
    label: "Kho câu hỏi",
    description: "Ngưỡng tồn kho và giới hạn khi tạo câu hỏi thủ công.",
    icon: IconDatabase,
  },
  jobs: {
    label: "Job nền",
    description: "Bật/tắt và giới hạn khối lượng cho các job chạy tự động.",
    icon: IconPlayerPlay,
  },
}

export function getCategoryMeta(category: string) {
  return (
    CONFIG_CATEGORY_META[category] ?? {
      label: category,
      description: "",
      icon: IconAdjustmentsAlt,
    }
  )
}

export const CONFIG_TYPE_LABELS: Record<ConfigRecordType, string> = {
  str: "Chuỗi",
  num: "Số",
  boolean: "Bật/tắt",
  arr: "Danh sách",
  obj: "Đối tượng",
}

export const JSON_EDITOR_ROWS = 8
