import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/common/page-header.tsx"
import { AiModelsPanel } from "@/features/ai-models/components/ai-models-panel.tsx"
import { HealthCard } from "@/features/metadata/components/health-card.tsx"
import { PickQuizTypeCard } from "@/features/metadata/components/pick-quiz-type-card.tsx"
import { QuizTypesPanel } from "@/features/metadata/components/quiz-types-panel.tsx"
import { RandomPairsPanel } from "@/features/metadata/components/random-pairs-panel.tsx"

export const Route = createFileRoute("/_dashboard/metadata")({
  component: MetadataPage,
})

function MetadataPage() {
  return (
    <>
      <PageHeader
        title="Metadata & Health"
        description="Tra cứu dữ liệu tham chiếu của API và kiểm tra tình trạng dịch vụ."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <HealthCard />
        <PickQuizTypeCard />
        <QuizTypesPanel />
        <RandomPairsPanel />
        <AiModelsPanel className="md:col-span-2" />
      </div>
    </>
  )
}
