import { Link, createFileRoute } from "@tanstack/react-router"
import { IconArrowLeft } from "@tabler/icons-react"

import { getGetAdminModelsQueryOptions } from "@/apis/admin-models/admin-models.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { Button } from "@/components/ui/button"
import { ManualRefillPage } from "@/features/question-pool/components/manual-refill-page.tsx"

export const Route = createFileRoute("/_dashboard/question-pool/refill")({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(getGetAdminModelsQueryOptions()),
  component: RefillPage,
})

function RefillPage() {
  return (
    <>
      <PageHeader
        title="Refill hàng loạt"
        description="Sinh thêm câu cho nhiều bucket cùng lúc. Job chạy nền, theo dõi ở màn Lịch sử cron."
        actions={
          <Button variant="outline" render={<Link to="/question-pool" />}>
            <IconArrowLeft stroke={1.5} data-icon="inline-start" />
            Kho câu hỏi
          </Button>
        }
      />

      <ManualRefillPage />
    </>
  )
}
