import type { Icon } from "@tabler/icons-react"
import {
  IconAdjustmentsAlt,
  IconClockBolt,
  IconDatabase,
  IconKey,
  IconLayoutGrid,
  IconListDetails,
  IconShieldCheck,
  IconSparkles,
  IconTags,
  IconUsersGroup,
} from "@tabler/icons-react"

export type NavPath =
  | "/"
  | "/topics"
  | "/question-pool"
  | "/generate"
  | "/metadata"
  | "/config"
  | "/cron-runs"

export interface NavItem {
  key: string
  label: string
  icon: Icon
  to?: NavPath
}

export interface NavGroup {
  key: string
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "overview",
    label: "Tổng quan",
    items: [
      {
        key: "dashboard",
        label: "Bảng điều khiển",
        icon: IconLayoutGrid,
        to: "/",
      },
    ],
  },
  {
    key: "content",
    label: "Nội dung",
    items: [
      { key: "topics", label: "Chủ đề", icon: IconTags, to: "/topics" },
      {
        key: "question-pool",
        label: "Kho câu hỏi",
        icon: IconDatabase,
        to: "/question-pool",
      },
      {
        key: "generation",
        label: "Tạo câu hỏi",
        icon: IconSparkles,
        to: "/generate",
      },
      {
        key: "meta",
        label: "Metadata & Health",
        icon: IconListDetails,
        to: "/metadata",
      },
    ],
  },
  {
    key: "system",
    label: "Hệ thống",
    items: [
      {
        key: "config",
        label: "Cấu hình",
        icon: IconAdjustmentsAlt,
        to: "/config",
      },
      {
        key: "cron",
        label: "Lịch sử cron",
        icon: IconClockBolt,
        to: "/cron-runs",
      },
    ],
  },
  {
    key: "admin",
    label: "Quản trị",
    items: [
      { key: "tenants", label: "Tenant", icon: IconUsersGroup },
      { key: "api-keys", label: "API key", icon: IconKey },
      { key: "grants", label: "Phân quyền", icon: IconShieldCheck },
    ],
  },
]

export const NAV_ITEMS_BY_PATH = new Map<NavPath, NavItem>(
  NAV_GROUPS.flatMap((group) => group.items)
    .filter((item): item is NavItem & { to: NavPath } => item.to !== undefined)
    .map((item) => [item.to, item])
)
