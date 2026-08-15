import { createFileRoute, redirect } from "@tanstack/react-router"

/** Trang refill đã gộp về `/refill` dạng tab. Giữ route này để link cũ không chết. */
export const Route = createFileRoute("/_dashboard/readings/refill")({
  beforeLoad: () => {
    throw redirect({
      to: "/refill",
      search: { tab: "readings" },
      replace: true,
    })
  },
})
