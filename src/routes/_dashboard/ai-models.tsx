import { createFileRoute } from "@tanstack/react-router"

import { getGetAdminModelsQueryOptions } from "@/apis/admin-models/admin-models.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { AiModelsPanel } from "@/features/ai-models/components/ai-models-panel.tsx"

export const Route = createFileRoute("/_dashboard/ai-models")({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(getGetAdminModelsQueryOptions()),
  component: AiModelsPage,
})

function AiModelsPage() {
  return (
    <>
      <PageHeader
        title="AI Model"
        description="Quản lý model OpenRouter dùng để sinh câu hỏi: bật/tắt theo ngữ cảnh, định tuyến provider và giá tham chiếu."
      />

      <AiModelsPanel />
    </>
  )
}
