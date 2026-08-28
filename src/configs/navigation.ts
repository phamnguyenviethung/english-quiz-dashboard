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
  | "/pool-review"
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
  to: NavPath
}

export interface NavGroup {
  key: string
  /** Bỏ trống để group render không có label (dùng cho item đứng riêng đầu sidebar). */
  label?: string
  items: NavItem[]
}

export interface NavLocation {
  group: NavGroup
  item: NavItem
}

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "overview",
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
        key: "pool-review",
        label: "Duyệt câu hỏi AI",
        icon: IconSparkles,
        to: "/pool-review",
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
    ],
  },
  {
    key: "generation",
    label: "Sinh nội dung",
    items: [
      // Sinh hàng loạt phục vụ cả kho câu hỏi lẫn kho bài đọc (3 tab) nên đứng
      // riêng thay vì nằm dưới một trong các kho.
      {
        key: "refill",
        label: "Sinh hàng loạt",
        icon: IconStack2,
        to: "/refill",
      },
      {
        key: "generate",
        label: "Tạo thử",
        icon: IconSparkles,
        to: "/generate",
      },
    ],
  },
  {
    key: "operations",
    label: "Vận hành",
    items: [
      {
        key: "cron",
        label: "Lịch sử cron",
        icon: IconClockBolt,
        to: "/cron-runs",
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
      // API key và phân quyền đều nested dưới 1 tenant nên nằm trong tab của
      // trang chi tiết, không tách nav item riêng.
      { key: "tenants", label: "Tenant", icon: IconUsersGroup, to: "/tenants" },
    ],
  },
]

export const NAV_LOCATIONS_BY_PATH = new Map<NavPath, NavLocation>(
  NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => [item.to, { group, item }] as const)
  )
)

/** Dấu `/` ở cuối prefix để `/readings` không nuốt `/reading-questions`. */
export function isNavItemActive(pathname: string, to: NavPath): boolean {
  return pathname === to || (to !== "/" && pathname.startsWith(`${to}/`))
}

/** Khớp cả route con (vd `/tenants/3` → nav item `/tenants`) để breadcrumb không rơi về fallback. */
export function findNavLocation(pathname: string): NavLocation | undefined {
  const exact = NAV_LOCATIONS_BY_PATH.get(pathname as NavPath)
  if (exact) return exact

  let matched: NavLocation | undefined
  let matchedLength = 0
  for (const [path, location] of NAV_LOCATIONS_BY_PATH) {
    if (!isNavItemActive(pathname, path)) continue
    if (path.length > matchedLength) {
      matched = location
      matchedLength = path.length
    }
  }
  return matched
}
