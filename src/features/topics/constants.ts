export const TOPIC_STATUS_META: Record<
  "active" | "inactive",
  { label: string; variant: "secondary" | "outline" }
> = {
  active: { label: "Active", variant: "secondary" },
  inactive: { label: "Inactive", variant: "outline" },
}
