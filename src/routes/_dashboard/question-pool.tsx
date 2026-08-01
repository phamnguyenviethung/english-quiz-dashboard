import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { getGetEnglishPoolCountQueryKey } from "@/apis/english-question-pool/english-question-pool.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import { ENG_LEVELS, OPTION_COUNTS } from "@/features/quiz/constants.ts"
import { PoolCoverageGrid } from "@/features/question-pool/components/pool-coverage-grid.tsx"
import { PoolFilters } from "@/features/question-pool/components/pool-filters.tsx"
import { PoolPreviewDialog } from "@/features/question-pool/components/pool-preview-dialog.tsx"
import { useFillPool } from "@/features/question-pool/hooks/use-fill-pool.ts"
import { usePendingFills } from "@/features/question-pool/hooks/use-pending-fills.ts"
import { usePoolCoverage } from "@/features/question-pool/hooks/use-pool-coverage.ts"
import type { EngLevel, OptionCount } from "@/features/quiz/types.ts"
import { formatNumber } from "@/lib/format.ts"
import { useQueryClient } from "@tanstack/react-query"

interface PoolSearch {
  engLevel?: EngLevel
  topicId?: number
  optionCount?: OptionCount
}

export const Route = createFileRoute("/_dashboard/question-pool")({
  validateSearch: (search: Record<string, unknown>): PoolSearch => {
    const engLevel = ENG_LEVELS.find((level) => level === search.engLevel)
    const parsedOptionCount = Number(search.optionCount)
    const optionCount = OPTION_COUNTS.find(
      (count) => count === parsedOptionCount
    )
    const parsedTopicId = Number(search.topicId)
    const topicId =
      Number.isInteger(parsedTopicId) && parsedTopicId > 0
        ? parsedTopicId
        : undefined

    return {
      ...(engLevel ? { engLevel } : {}),
      ...(optionCount ? { optionCount } : {}),
      ...(topicId ? { topicId } : {}),
    }
  },
  component: QuestionPoolPage,
})

function QuestionPoolPage() {
  const search = Route.useSearch()
  const engLevel = search.engLevel ?? ENG_LEVELS[0]
  const optionCount = search.optionCount ?? OPTION_COUNTS[0]
  const topicId = search.topicId
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()
  const [previewOpen, setPreviewOpen] = useState(false)

  const { pending, markPending, clearPending } = usePendingFills()
  const { cells, total, authError } = usePoolCoverage({
    engLevel,
    topicId,
    pending,
  })
  const { fillBucket, pendingQuizType } = useFillPool({
    engLevel,
    topicId,
    optionCount,
    onEnqueued: markPending,
  })

  const updateSearch = (patch: Partial<PoolSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  }

  const refreshAll = () => {
    for (const quizType of pending) clearPending(quizType)
    void queryClient.invalidateQueries({
      queryKey: getGetEnglishPoolCountQueryKey(),
    })
  }

  return (
    <>
      <PageHeader
        title="Kho câu hỏi"
        description={
          total === undefined
            ? "Số câu hỏi có sẵn theo từng loại, ở cấp độ và chủ đề đang chọn."
            : `Có sẵn ${formatNumber(total)} câu ở cấp độ ${engLevel}.`
        }
      />

      <PoolFilters
        engLevel={engLevel}
        topicId={topicId}
        optionCount={optionCount}
        isRefreshing={cells.some((cell) => cell.isFetching)}
        onEngLevelChange={(value) => updateSearch({ engLevel: value })}
        onTopicChange={(value) => updateSearch({ topicId: value })}
        onOptionCountChange={(value) => updateSearch({ optionCount: value })}
        onRefresh={refreshAll}
        onPreview={() => setPreviewOpen(true)}
      />

      {authError ? (
        <QueryError
          title="Không xác thực được với API"
          error={authError}
          onRetry={refreshAll}
        />
      ) : (
        <PoolCoverageGrid
          cells={cells}
          pending={pending}
          fillingQuizType={pendingQuizType}
          onFill={fillBucket}
        />
      )}

      <PoolPreviewDialog
        open={previewOpen}
        engLevel={engLevel}
        topicId={topicId}
        onOpenChange={setPreviewOpen}
      />
    </>
  )
}
