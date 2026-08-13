import { Link, createFileRoute } from "@tanstack/react-router"
import { IconArrowLeft } from "@tabler/icons-react"

import { getGetAdminModelsQueryOptions } from "@/apis/admin-models/admin-models.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { Button } from "@/components/ui/button"
import { ReadingRefillPage } from "@/features/readings/components/reading-refill-page.tsx"

export const Route = createFileRoute("/_dashboard/readings/refill")({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(getGetAdminModelsQueryOptions()),
  component: RefillPage,
})

function RefillPage() {
  return (
    <>
      <PageHeader
        title="Sinh bài đọc hàng loạt"
        description="Sinh thêm bài cho nhiều bucket cùng lúc. Job chạy nền, theo dõi ở màn Lịch sử cron."
        actions={
          <Button variant="outline" render={<Link to="/readings" />}>
            <IconArrowLeft stroke={1.5} data-icon="inline-start" />
            Kho bài đọc
          </Button>
        }
      />

      <ReadingRefillPage />
    </>
  )
}
