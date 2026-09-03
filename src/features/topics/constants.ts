export const ALL_STATUS_VALUE = "all"
export const ALL_STATUS_LABEL = "Tất cả"

export const ACTIVE_VALUE = "active"
export const INACTIVE_VALUE = "inactive"

export const TOPIC_STATUS_META: Record<
  "active" | "inactive",
  { label: string; variant: "secondary" | "outline" }
> = {
  active: { label: "Đang bật", variant: "secondary" },
  inactive: { label: "Đã tắt", variant: "outline" },
}

export const FILTER_PILL = "h-9 w-auto max-w-64 gap-1.5 rounded-3xl"
export const FILTER_PILL_ACTIVE =
  "border-border bg-secondary text-secondary-foreground"
export const FILTER_PILL_LABEL = "text-foreground/60"

export const TOPICS_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [20, 50, 100]

export const DEFAULT_TOPIC_SORT = "id_asc" as const
export const TOPIC_SORTS = [
  "id_asc",
  "id_desc",
  "name_asc",
  "name_desc",
  "created_asc",
  "created_desc",
] as const

export type TopicsSort = (typeof TOPIC_SORTS)[number]
export type TopicSortableColumn = "id" | "name" | "createdAt"
