import { useState } from "react"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { IconEye, IconSearchOff, IconStack2 } from "@tabler/icons-react"

import {
  getGetEnglishPoolQuestionsQueryKey,
  getGetEnglishPoolQuestionsQueryOptions,
} from "@/apis/english-question-pool/english-question-pool.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  ENG_LEVELS,
  OPTION_COUNTS,
  QUIZ_TYPES,
} from "@/features/quiz/constants.ts"
import { PoolColumnVisibilityMenu } from "@/features/question-pool/components/pool-column-visibility-menu.tsx"
import { PoolPreviewDialog } from "@/features/question-pool/components/pool-preview-dialog.tsx"
import { PoolQuestionDetailSheet } from "@/features/question-pool/components/pool-question-detail-sheet.tsx"
import { PoolQuestionsPagination } from "@/features/question-pool/components/pool-questions-pagination.tsx"
import { PoolQuestionsTable } from "@/features/question-pool/components/pool-questions-table.tsx"
import { PoolQuestionsToolbar } from "@/features/question-pool/components/pool-questions-toolbar.tsx"
import type { PoolToolbarFilters } from "@/features/question-pool/components/pool-questions-toolbar.tsx"
import {
  PAGE_SIZE_OPTIONS,
  QUESTIONS_PAGE_SIZE,
} from "@/features/question-pool/constants.ts"
import { usePoolColumnVisibility } from "@/features/question-pool/hooks/use-pool-column-visibility.ts"
import {
  buildPoolQuestionsParams,
  usePoolQuestions,
} from "@/features/question-pool/hooks/use-pool-questions.ts"
import { usePoolTable } from "@/features/question-pool/hooks/use-pool-table.ts"
import type { PoolQuestionsSort } from "@/features/question-pool/types.ts"
import {
  DEFAULT_POOL_SORT,
  POOL_SORTS,
  sortToSortingState,
  sortingStateToSort,
} from "@/features/question-pool/utils/sort.ts"
import type { EngLevel, OptionCount, QuizType } from "@/features/quiz/types.ts"
import { formatNumber } from "@/lib/format.ts"

interface PoolSearch {
  q?: string
  engLevel?: EngLevel
  topicId?: number
  optionCount?: OptionCount
  quizType?: QuizType
  model?: string
  noTopic?: boolean
  createdFrom?: string
  createdTo?: string
  sort?: PoolQuestionsSort
  page?: number
  pageSize?: number
  questionId?: number
}

function parseIsoParam(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined
  return Number.isNaN(Date.parse(value)) ? undefined : value
}

export const Route = createFileRoute("/_dashboard/question-pool/")({
  validateSearch: (search: Record<string, unknown>): PoolSearch => {
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
    const model =
      typeof search.model === "string" && search.model.trim()
        ? search.model.trim()
        : undefined
    const parsedTopicId = Number(search.topicId)
    const topicId =
      Number.isInteger(parsedTopicId) && parsedTopicId > 0
        ? parsedTopicId
        : undefined
    const noTopic = search.noTopic === true || search.noTopic === "true"
    const createdFrom = parseIsoParam(search.createdFrom)
    const createdTo = parseIsoParam(search.createdTo)
    const sort = POOL_SORTS.find((value) => value === search.sort)
    const parsedPage = Number(search.page)
    const page =
      Number.isInteger(parsedPage) && parsedPage > 1 ? parsedPage : undefined
    const parsedPageSize = Number(search.pageSize)
    const pageSize = PAGE_SIZE_OPTIONS.find(
      (size) => size === parsedPageSize && size !== QUESTIONS_PAGE_SIZE
    )
    const parsedQuestionId = Number(search.questionId)
    const questionId =
      Number.isInteger(parsedQuestionId) && parsedQuestionId > 0
        ? parsedQuestionId
        : undefined

    return {
      ...(q ? { q } : {}),
      ...(engLevel ? { engLevel } : {}),
      ...(optionCount ? { optionCount } : {}),
      ...(quizType ? { quizType } : {}),
      ...(model ? { model } : {}),
      // topicId và noTopic loại trừ nhau — noTopic là bucket riêng (topicId IS NULL).
      ...(noTopic ? { noTopic } : topicId ? { topicId } : {}),
      ...(createdFrom ? { createdFrom } : {}),
      ...(createdTo ? { createdTo } : {}),
      ...(sort ? { sort } : {}),
      ...(page ? { page } : {}),
      ...(pageSize ? { pageSize } : {}),
      ...(questionId ? { questionId } : {}),
    }
  },
  loaderDeps: ({ search }) => ({
    params: buildPoolQuestionsParams({
      q: search.q,
      engLevel: search.engLevel,
      quizType: search.quizType,
      topicId: search.topicId,
      noTopic: search.noTopic ?? false,
      model: search.model,
      optionCount: search.optionCount,
      createdFrom: search.createdFrom,
      createdTo: search.createdTo,
      // Phải khớp default dùng trong component, nếu không params ở loader và ở
      // component lệch nhau => query key khác nhau => prefetch không hit cache lúc SSR.
      sort: search.sort ?? DEFAULT_POOL_SORT,
      page: search.page ?? 1,
      pageSize: search.pageSize ?? QUESTIONS_PAGE_SIZE,
    }),
  }),
  loader: ({ context, deps }) =>
    context.queryClient.prefetchQuery(
      getGetEnglishPoolQuestionsQueryOptions(deps.params)
    ),
  component: QuestionPoolPage,
})

function QuestionPoolPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()
  const [previewOpen, setPreviewOpen] = useState(false)

  const { columnVisibility, setColumnVisibility, resetVisibility } =
    usePoolColumnVisibility()

  const noTopic = search.noTopic ?? false
  const sort = search.sort ?? DEFAULT_POOL_SORT
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? QUESTIONS_PAGE_SIZE

  const params = buildPoolQuestionsParams({
    q: search.q,
    engLevel: search.engLevel,
    quizType: search.quizType,
    topicId: search.topicId,
    noTopic,
    model: search.model,
    optionCount: search.optionCount,
    createdFrom: search.createdFrom,
    createdTo: search.createdTo,
    sort,
    page,
    pageSize,
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

  const updateSearch = (patch: Partial<PoolSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  }

  // Đổi filter luôn kéo về trang 1: trang hiện tại có thể vượt quá totalPages mới.
  // Sheet chi tiết đọc row từ trang đang tải nên cũng phải đóng theo.
  const applyFilter = (patch: Partial<PoolSearch>) =>
    updateSearch({ ...patch, page: undefined, questionId: undefined })

  const filters: PoolToolbarFilters = {
    q: search.q,
    engLevel: search.engLevel,
    quizType: search.quizType,
    topicId: search.topicId,
    noTopic,
    model: search.model,
    optionCount: search.optionCount,
    createdFrom: search.createdFrom,
    createdTo: search.createdTo,
  }

  const hasActiveFilter = countActiveFilters(filters) > 0

  const clearAllFilters = () =>
    applyFilter({
      q: undefined,
      engLevel: undefined,
      quizType: undefined,
      topicId: undefined,
      noTopic: undefined,
      model: undefined,
      optionCount: undefined,
      createdFrom: undefined,
      createdTo: undefined,
    })

  const isEmpty = !isPending && items?.length === 0
  const selectedQuestion = items?.find(
    (question) => question.id === search.questionId
  )

  const table = usePoolTable({
    questions: items,
    sorting: sortToSortingState(sort),
    columnVisibility,
    onSortingChange: (sorting) =>
      applyFilter({ sort: sortingStateToSort(sorting) }),
    onColumnVisibilityChange: setColumnVisibility,
  })

  return (
    <>
      <PageHeader
        title="Kho câu hỏi"
        description={
          total === undefined
            ? "Toàn bộ câu hỏi đang lưu trong pool, lọc theo cấp độ, loại câu, chủ đề và model."
            : `${formatNumber(total)} câu khớp bộ lọc hiện tại.`
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              <IconEye stroke={1.5} data-icon="inline-start" />
              Xem thử 1 câu
            </Button>
            <Button render={<Link to="/question-pool/refill" />}>
              <IconStack2 stroke={1.5} data-icon="inline-start" />
              Refill hàng loạt
            </Button>
          </>
        }
      />

      <PoolQuestionsToolbar
        filters={filters}
        hasActiveFilter={hasActiveFilter}
        isRefreshing={isRefetching}
        onSearchChange={(value) => applyFilter({ q: value })}
        onFilterChange={(patch) => applyFilter(patch)}
        onClearAll={clearAllFilters}
        onRefresh={() =>
          void queryClient.invalidateQueries({
            queryKey: getGetEnglishPoolQuestionsQueryKey(),
          })
        }
      >
        <PoolColumnVisibilityMenu table={table} onReset={resetVisibility} />
      </PoolQuestionsToolbar>

      {isError ? (
        <QueryError
          title="Không tải được danh sách câu hỏi"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isEmpty ? (
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
                  : 'Pool đang trống. Bấm "Refill hàng loạt" ở trên hoặc chờ job nền chạy.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <PoolQuestionsTable
            table={table}
            isPending={isPending}
            isRefetching={isRefetching}
            selectedQuestionId={search.questionId}
            onSelect={(questionId) => updateSearch({ questionId })}
          />
          <PoolQuestionsPagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            total={total}
            onPageChange={(value) =>
              updateSearch({
                page: value > 1 ? value : undefined,
                questionId: undefined,
              })
            }
            onPageSizeChange={(value) => applyFilter({ pageSize: value })}
          />
        </>
      )}

      <PoolQuestionDetailSheet
        question={selectedQuestion}
        onOpenChange={(open) => {
          if (!open) updateSearch({ questionId: undefined })
        }}
      />

      <PoolPreviewDialog
        open={previewOpen}
        engLevel={search.engLevel ?? ENG_LEVELS[0]}
        topicId={search.topicId}
        onOpenChange={setPreviewOpen}
      />
    </>
  )
}

/** Mỗi pill filter tự hiển thị giá trị của nó, ở đây chỉ cần biết có cái nào đang bật không. */
function countActiveFilters(filters: PoolToolbarFilters): number {
  return [
    filters.q,
    filters.engLevel,
    filters.quizType,
    filters.noTopic || filters.topicId !== undefined,
    filters.model,
    filters.optionCount,
    filters.createdFrom ?? filters.createdTo,
  ].filter(Boolean).length
}
