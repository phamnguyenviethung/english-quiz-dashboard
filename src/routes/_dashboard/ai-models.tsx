import { createFileRoute } from "@tanstack/react-router"
import { getGetAdminModelsQueryOptions } from "@/apis/admin-models/admin-models.ts"

import { AiModelsPanel } from "@/features/ai-models/components/ai-models-panel.tsx"

export const Route = createFileRoute("/_dashboard/ai-models")({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(getGetAdminModelsQueryOptions()),
  component: AiModelsPage,
})

function AiModelsPage() {
  return <AiModelsPanel />
}
