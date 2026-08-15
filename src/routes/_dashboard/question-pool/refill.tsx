import { createFileRoute, redirect } from "@tanstack/react-router"

/** Trang refill đã gộp về `/refill` dạng tab. Giữ route này để link cũ không chết. */
export const Route = createFileRoute("/_dashboard/question-pool/refill")({
  beforeLoad: () => {
    throw redirect({ to: "/refill", replace: true })
  },
})
