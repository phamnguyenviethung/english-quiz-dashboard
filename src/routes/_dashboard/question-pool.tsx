import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { IconSearchOff } from "@tabler/icons-react"

import {
  getGetEnglishPoolCountQueryKey,
  getGetEnglishPoolQuestionsQueryKey,
  getGetEnglishPoolQuestionsQueryOptions,
} from "@/apis/english-question-pool/english-question-pool.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ENG_LEVELS,
  OPTION_COUNTS,
  QUIZ_TYPES,
} from "@/features/quiz/constants.ts"
import { ManualRefillDialog } from "@/features/question-pool/components/manual-refill-dialog.tsx"
import { PoolCoverageGrid } from "@/features/question-pool/components/pool-coverage-grid.tsx"
import { PoolFilters } from "@/features/question-pool/components/pool-filters.tsx"
import { PoolPreviewDialog } from "@/features/question-pool/components/pool-preview-dialog.tsx"
import { PoolQuestionDetailSheet } from "@/features/question-pool/components/pool-question-detail-sheet.tsx"
import { PoolQuestionsFilters } from "@/features/question-pool/components/pool-questions-filters.tsx"
import { PoolQuestionsPagination } from "@/features/question-pool/components/pool-questions-pagination.tsx"
import { PoolQuestionsTable } from "@/features/question-pool/components/pool-questions-table.tsx"
import { useFillPool } from "@/features/question-pool/hooks/use-fill-pool.ts"
import { useManualRefill } from "@/features/question-pool/hooks/use-manual-refill.ts"
import { usePendingFills } from "@/features/question-pool/hooks/use-pending-fills.ts"
import { usePoolCoverage } from "@/features/question-pool/hooks/use-pool-coverage.ts"
import {
  buildPoolQuestionsParams,
  usePoolQuestions,
} from "@/features/question-pool/hooks/use-pool-questions.ts"
import type { PoolQuestionsSort } from "@/features/question-pool/types.ts"
import type { EngLevel, OptionCount, QuizType } from "@/features/quiz/types.ts"
import { formatNumber } from "@/lib/format.ts"
import { useQueryClient } from "@tanstack/react-query"

type PoolTab = "overview" | "list"

const POOL_TABS: PoolTab[] = ["overview", "list"]

const POOL_SORTS: PoolQuestionsSort[] = ["id_asc", "id_desc"]

interface PoolSearch {
  tab?: PoolTab
  q?: string
  engLevel?: EngLevel
  topicId?: number
  optionCount?: OptionCount
  quizType?: QuizType
  noTopic?: boolean
  sort?: PoolQuestionsSort
  page?: number
  questionId?: number
}

export const Route = createFileRoute("/_dashboard/question-pool")({
  validateSearch: (search: Record<string, unknown>): PoolSearch => {
    const tab = POOL_TABS.find((value) => value === search.tab)
    const q =
      typeof search.q === "string" && search.q.trim()
        ? search.q.trim().slice(0, 100)
        : undefined
    const engLevel = ENG_LEVELS.find((level) => level === search.engLevel)
    const quizType = QUIZ_TYPES.find((type) => type === search.quizType)
    const parsedOptionCount = Number(search.optionCount)
    const optionCount = OPTION_COUNTS.find(
      (count) => count === parsedOptionCount
    )
    const parsedTopicId = Number(search.topicId)
    const topicId =
      Number.isInteger(parsedTopicId) && parsedTopicId > 0
        ? parsedTopicId
        : undefined
    const noTopic = search.noTopic === true || search.noTopic === "true"
    const sort = POOL_SORTS.find((value) => value === search.sort)
    const parsedPage = Number(search.page)
    const page =
      Number.isInteger(parsedPage) && parsedPage > 1 ? parsedPage : undefined
    const parsedQuestionId = Number(search.questionId)
    const questionId =
      Number.isInteger(parsedQuestionId) && parsedQuestionId > 0
        ? parsedQuestionId
        : undefined

    return {
      ...(tab ? { tab } : {}),
      ...(q ? { q } : {}),
      ...(engLevel ? { engLevel } : {}),
      ...(optionCount ? { optionCount } : {}),
      ...(quizType ? { quizType } : {}),
      // topicId và noTopic loại trừ nhau — noTopic là bucket riêng (topicId IS NULL).
      ...(noTopic ? { noTopic } : topicId ? { topicId } : {}),
      ...(sort ? { sort } : {}),
      ...(page ? { page } : {}),
      ...(questionId ? { questionId } : {}),
    }
  },
  loaderDeps: ({ search }) => ({
    tab: search.tab ?? "overview",
    params: buildPoolQuestionsParams({
      q: search.q,
      engLevel: search.engLevel,
      quizType: search.quizType,
      topicId: search.topicId,
      noTopic: search.noTopic ?? false,
      // Phải khớp default "id_asc" dùng trong ListTab, nếu không params ở loader và ở
      // component lệch nhau => query key khác nhau => prefetch không hit cache lúc SSR.
      sort: search.sort ?? "id_asc",
      page: search.page ?? 1,
    }),
  }),
  loader: ({ context, deps }) => {
    if (deps.tab !== "list") return
    return context.queryClient.prefetchQuery(
      getGetEnglishPoolQuestionsQueryOptions(deps.params)
    )
  },
  component: QuestionPoolPage,
})

function QuestionPoolPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()
  const [previewOpen, setPreviewOpen] = useState(false)

  const tab = search.tab ?? "overview"

  const updateSearch = (patch: Partial<PoolSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  }

  return (
    <>
      <Tabs
        value={tab}
        onValueChange={(value) => updateSearch({ tab: value as PoolTab })}
        className="gap-6"
      >
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="list">Danh sách</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6">
          <OverviewTab
            search={search}
            updateSearch={updateSearch}
            previewOpen={previewOpen}
            onPreviewOpenChange={setPreviewOpen}
            queryClient={queryClient}
          />
        </TabsContent>

        <TabsContent value="list" className="flex flex-col gap-6">
          <ListTab
            search={search}
            updateSearch={updateSearch}
            queryClient={queryClient}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}

type QueryClientType = ReturnType<typeof useQueryClient>

function OverviewTab({
  search,
  updateSearch,
  previewOpen,
  onPreviewOpenChange,
  queryClient,
}: {
  search: PoolSearch
  updateSearch: (patch: Partial<PoolSearch>) => void
  previewOpen: boolean
  onPreviewOpenChange: (open: boolean) => void
  queryClient: QueryClientType
}) {
  // Coverage grid luôn cần đúng 1 cấp độ, nên fallback A1 khi search chưa chọn.
  const engLevel = search.engLevel ?? ENG_LEVELS[0]
  const optionCount = search.optionCount ?? OPTION_COUNTS[0]
  const topicId = search.topicId

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
  const { startRefill, isPending: isRefillPending } = useManualRefill()

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
        actions={
          <ManualRefillDialog
            isPending={isRefillPending}
            onConfirm={startRefill}
          />
        }
      />

      <PoolFilters
        engLevel={engLevel}
        topicId={topicId}
        optionCount={optionCount}
        isRefreshing={cells.some((cell) => cell.isFetching)}
        onEngLevelChange={(value) => updateSearch({ engLevel: value })}
        onTopicChange={(value) =>
          updateSearch({ topicId: value, noTopic: undefined })
        }
        onOptionCountChange={(value) => updateSearch({ optionCount: value })}
        onRefresh={refreshAll}
        onPreview={() => onPreviewOpenChange(true)}
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
        onOpenChange={onPreviewOpenChange}
      />
    </>
  )
}

function ListTab({
  search,
  updateSearch,
  queryClient,
}: {
  search: PoolSearch
  updateSearch: (patch: Partial<PoolSearch>) => void
  queryClient: QueryClientType
}) {
  const noTopic = search.noTopic ?? false
  const sort = search.sort ?? "id_asc"
  const page = search.page ?? 1

  const params = buildPoolQuestionsParams({
    q: search.q,
    engLevel: search.engLevel,
    quizType: search.quizType,
    topicId: search.topicId,
    noTopic,
    sort,
    page,
  })

  const {
    items,
    total,
    totalPages,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = usePoolQuestions(params)

  const hasActiveFilter = Boolean(
    search.q || search.engLevel || search.quizType || search.topicId || noTopic
  )

  // Đổi filter luôn kéo về trang 1: trang hiện tại có thể vượt quá totalPages mới.
  // Sheet chi tiết đọc row từ trang đang tải nên cũng phải đóng theo.
  const applyFilter = (patch: Partial<PoolSearch>) =>
    updateSearch({ ...patch, page: undefined, questionId: undefined })

  const selectedQuestion = items.find(
    (question) => question.id === search.questionId
  )

  return (
    <>
      <PageHeader
        title="Kho câu hỏi"
        description={
          total === undefined
            ? "Toàn bộ câu hỏi đang lưu trong pool, lọc theo cấp độ, loại câu và chủ đề."
            : `${formatNumber(total)} câu khớp bộ lọc hiện tại.`
        }
      />

      <PoolQuestionsFilters
        q={search.q}
        engLevel={search.engLevel}
        quizType={search.quizType}
        topicId={search.topicId}
        noTopic={noTopic}
        hasActiveFilter={hasActiveFilter}
        isRefreshing={isRefetching}
        onSearchChange={(value) => applyFilter({ q: value })}
        onEngLevelChange={(value) => applyFilter({ engLevel: value })}
        onQuizTypeChange={(value) => applyFilter({ quizType: value })}
        onTopicChange={(value) =>
          applyFilter({
            topicId: value.topicId,
            noTopic: value.noTopic,
          })
        }
        onClear={() =>
          applyFilter({
            q: undefined,
            engLevel: undefined,
            quizType: undefined,
            topicId: undefined,
            noTopic: undefined,
          })
        }
        onRefresh={() =>
          void queryClient.invalidateQueries({
            queryKey: getGetEnglishPoolQuestionsQueryKey(),
          })
        }
      />

      {isError ? (
        <QueryError
          title="Không tải được danh sách câu hỏi"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : !isPending && items.length === 0 ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconSearchOff stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Không có câu hỏi nào</EmptyTitle>
            <EmptyDescription>
              {search.q
                ? `Không có câu nào khớp từ khoá "${search.q}". Thử từ khoá khác hoặc bỏ bớt điều kiện lọc.`
                : hasActiveFilter
                  ? "Không có câu nào khớp bộ lọc hiện tại. Thử bỏ bớt điều kiện lọc."
                  : "Pool đang trống. Tạo câu ở tab Tổng quan hoặc chờ job nền chạy."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <PoolQuestionsTable
            questions={items}
            isPending={isPending}
            sort={sort}
            selectedQuestionId={search.questionId}
            onToggleSort={() =>
              applyFilter({ sort: sort === "id_asc" ? "id_desc" : "id_asc" })
            }
            onSelect={(questionId) => updateSearch({ questionId })}
          />
          <PoolQuestionsPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={(value) =>
              updateSearch({
                page: value > 1 ? value : undefined,
                questionId: undefined,
              })
            }
          />
        </>
      )}

      <PoolQuestionDetailSheet
        question={selectedQuestion}
        onOpenChange={(open) => {
          if (!open) updateSearch({ questionId: undefined })
        }}
      />
    </>
  )
}
