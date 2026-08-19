import type { Icon } from "@tabler/icons-react"
import {
  IconBook,
  IconChartPie,
  IconClockPlay,
  IconDatabase,
  IconHelpCircle,
  IconWand,
} from "@tabler/icons-react"

import type {
  ConfigRecordType,
  ConfigSectionKey,
  ConfigTabKey,
} from "./types.ts"

/** Nhóm cấp 1 — mỗi tab là một pipeline, khớp với `category` phía API. */
export const CONFIG_TABS = ["questions", "reading", "reading_question"] as const

export const DEFAULT_CONFIG_TAB: ConfigTabKey = "questions"

export const CONFIG_TAB_META: Record<
  ConfigTabKey,
  { label: string; description: string; icon: Icon }
> = {
  questions: {
    label: "Câu hỏi",
    description:
      "Kho câu hỏi trắc nghiệm: ngưỡng tồn kho, phân bổ loại câu hỏi và job refill.",
    icon: IconDatabase,
  },
  reading: {
    label: "Bài đọc",
    description:
      "Kho bài đọc: ngưỡng tồn kho, giới hạn sinh thủ công và job refill theo lịch.",
    icon: IconBook,
  },
  reading_question: {
    label: "Câu hỏi đọc hiểu",
    description:
      "Câu hỏi gắn với bài đọc: số câu mỗi bài, số lần thử và job refill theo lịch.",
    icon: IconHelpCircle,
  },
}

/** Nhóm cấp 2 — thứ tự khai báo cũng là thứ tự render trong mỗi tab. */
export const CONFIG_SECTIONS = [
  "threshold",
  "distribution",
  "manual",
  "automation",
] as const

export const CONFIG_SECTION_META: Record<
  ConfigSectionKey,
  { label: string; description: string; icon: Icon }
> = {
  threshold: {
    label: "Kho & ngưỡng",
    description:
      "Mức tồn kho giữ sẵn cho mỗi bucket và thời điểm job bắt đầu sinh bù.",
    icon: IconDatabase,
  },
  distribution: {
    label: "Phân bổ loại câu hỏi",
    description:
      "Trọng số bốc từng loại câu hỏi, dùng chung cho cả pool lẫn sinh realtime.",
    icon: IconChartPie,
  },
  manual: {
    label: "Sinh thủ công",
    description: "Giới hạn cho ô số lượng ở màn Sinh hàng loạt.",
    icon: IconWand,
  },
  automation: {
    label: "Tự động & lịch chạy",
    description:
      "Cờ bật/tắt job nền, trần khối lượng mỗi lần chạy và lịch cron.",
    icon: IconClockPlay,
  },
}

export const CONFIG_TYPE_LABELS: Record<ConfigRecordType, string> = {
  str: "Chuỗi",
  num: "Số",
  boolean: "Bật/tắt",
  arr: "Danh sách",
  obj: "Đối tượng",
}

export const JSON_EDITOR_ROWS = 8
