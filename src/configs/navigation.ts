import type { Icon } from "@tabler/icons-react"
import {
  IconAdjustmentsAlt,
  IconBook,
  IconClockBolt,
  IconCpu,
  IconDatabase,
  IconHelpCircle,
  IconLayoutGrid,
  IconListDetails,
  IconSparkles,
  IconStack2,
  IconTags,
  IconUsersGroup,
} from "@tabler/icons-react"

export type NavPath =
  | "/"
  | "/topics"
  | "/question-pool"
  | "/readings"
  | "/reading-questions"
  | "/refill"
  | "/generate"
  | "/metadata"
  | "/config"
  | "/ai-models"
  | "/cron-runs"
  | "/tenants"

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
        key: "readings",
        label: "Bài đọc",
        icon: IconBook,
        to: "/readings",
      },
      {
        key: "reading-questions",
        label: "Câu hỏi đọc hiểu",
        icon: IconHelpCircle,
        to: "/reading-questions",
      },
      // Sinh hàng loạt phục vụ cả kho câu hỏi lẫn kho bài đọc (2 tab) nên đứng
      // riêng thay vì nằm dưới một trong hai kho.
      {
        key: "refill",
        label: "Sinh hàng loạt",
        icon: IconStack2,
        to: "/refill",
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
        key: "ai-models",
        label: "AI Model",
        icon: IconCpu,
        to: "/ai-models",
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
      // API key và phân quyền đều nested dưới 1 tenant nên nằm trong tab của
      // trang chi tiết, không tách nav item riêng.
      { key: "tenants", label: "Tenant", icon: IconUsersGroup, to: "/tenants" },
    ],
  },
]

export const NAV_ITEMS_BY_PATH = new Map<NavPath, NavItem>(
  NAV_GROUPS.flatMap((group) => group.items)
    .filter((item): item is NavItem & { to: NavPath } => item.to !== undefined)
    .map((item) => [item.to, item])
)

/** Khớp cả route con (vd `/tenants/3` → nav item `/tenants`) để breadcrumb không rơi về fallback. */
export function findNavItemByPathname(pathname: string): NavItem | undefined {
  const exact = NAV_ITEMS_BY_PATH.get(pathname as NavPath)
  if (exact) return exact

  let matched: NavItem | undefined
  let matchedLength = 0
  for (const [path, item] of NAV_ITEMS_BY_PATH) {
    if (path === "/") continue
    if (pathname.startsWith(`${path}/`) && path.length > matchedLength) {
      matched = item
      matchedLength = path.length
    }
  }
  return matched
}
