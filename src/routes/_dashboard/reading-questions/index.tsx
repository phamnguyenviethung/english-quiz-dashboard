import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { IconSearchOff, IconStack2 } from "@tabler/icons-react"

import {
  getGetAdminReadingQuestionsQueryKey,
  getGetAdminReadingQuestionsQueryOptions,
} from "@/apis/admin-reading-questions/admin-reading-questions.ts"
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
  DEFAULT_READING_QUESTION_SORT,
  PAGE_SIZE_OPTIONS,
  READING_QUESTIONS_PAGE_SIZE,
  READING_QUESTION_SORTS,
  READING_QUESTION_TYPES,
} from "@/features/reading-questions/constants.ts"
import { ReadingQuestionDetailSheet } from "@/features/reading-questions/components/reading-question-detail-sheet.tsx"
import { ReadingQuestionsPagination } from "@/features/reading-questions/components/reading-questions-pagination.tsx"
import { ReadingQuestionsTable } from "@/features/reading-questions/components/reading-questions-table.tsx"
import { ReadingQuestionsToolbar } from "@/features/reading-questions/components/reading-questions-toolbar.tsx"
import type { ReadingQuestionsToolbarFilters } from "@/features/reading-questions/components/reading-questions-toolbar.tsx"
import {
  buildReadingQuestionsParams,
  useReadingQuestions,
} from "@/features/reading-questions/hooks/use-reading-questions.ts"
import type { ReadingQuestionsSort } from "@/features/reading-questions/types.ts"
import { ENG_LEVELS } from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"
import { READING_TYPES } from "@/features/readings/constants.ts"
import type { ReadingType } from "@/features/readings/types.ts"
import { formatNumber } from "@/lib/format.ts"

interface ReadingQuestionsSearch {
  q?: string
  cefrLevel?: EngLevel
  topicId?: number
  passageId?: number
  type?: ReadingType
  quizType?: string
  model?: string
  isActive?: boolean
  sort?: ReadingQuestionsSort
  page?: number
  pageSize?: number
  questionId?: number
}

function parsePositiveInt(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export const Route = createFileRoute("/_dashboard/reading-questions/")({
  validateSearch: (search: Record<string, unknown>): ReadingQuestionsSearch => {
    const q =
      typeof search.q === "string" && search.q.trim()
        ? search.q.trim().slice(0, 100)
        : undefined
    const cefrLevel = ENG_LEVELS.find((level) => level === search.cefrLevel)
    const type = READING_TYPES.find((value) => value === search.type)
    const quizType = READING_QUESTION_TYPES.find(
      (value) => value === search.quizType
    )
    const model =
      typeof search.model === "string" && search.model.trim()
        ? search.model.trim()
        : undefined
    const topicId = parsePositiveInt(search.topicId)
    const passageId = parsePositiveInt(search.passageId)
    const isActive =
      search.isActive === true || search.isActive === "true"
        ? true
        : search.isActive === false || search.isActive === "false"
          ? false
          : undefined
    const sort = READING_QUESTION_SORTS.find((value) => value === search.sort)
    const parsedPage = Number(search.page)
    const page =
      Number.isInteger(parsedPage) && parsedPage > 1 ? parsedPage : undefined
    const parsedPageSize = Number(search.pageSize)
    const pageSize = PAGE_SIZE_OPTIONS.find(
      (size) => size === parsedPageSize && size !== READING_QUESTIONS_PAGE_SIZE
    )
    const questionId = parsePositiveInt(search.questionId)

    return {
      ...(q ? { q } : {}),
      ...(cefrLevel ? { cefrLevel } : {}),
      ...(topicId ? { topicId } : {}),
      ...(passageId ? { passageId } : {}),
      ...(type ? { type } : {}),
      ...(quizType ? { quizType } : {}),
      ...(model ? { model } : {}),
      ...(isActive === undefined ? {} : { isActive }),
      ...(sort ? { sort } : {}),
      ...(page ? { page } : {}),
      ...(pageSize ? { pageSize } : {}),
      ...(questionId ? { questionId } : {}),
    }
  },
  loaderDeps: ({ search }) => ({
    params: buildReadingQuestionsParams({
      q: search.q,
      cefrLevel: search.cefrLevel,
      topicId: search.topicId,
      passageId: search.passageId,
      type: search.type,
      quizType: search.quizType,
      model: search.model,
      isActive: search.isActive,
      // Phải khớp default dùng trong component, nếu không params ở loader và ở
      // component lệch nhau => query key khác nhau => prefetch không hit cache lúc SSR.
      sort: search.sort ?? DEFAULT_READING_QUESTION_SORT,
      page: search.page ?? 1,
      pageSize: search.pageSize ?? READING_QUESTIONS_PAGE_SIZE,
    }),
  }),
  loader: ({ context, deps }) =>
    context.queryClient.prefetchQuery(
      getGetAdminReadingQuestionsQueryOptions(deps.params)
    ),
  component: ReadingQuestionsPage,
})

function ReadingQuestionsPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()

  const sort = search.sort ?? DEFAULT_READING_QUESTION_SORT
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? READING_QUESTIONS_PAGE_SIZE

  const params = buildReadingQuestionsParams({
    q: search.q,
    cefrLevel: search.cefrLevel,
    topicId: search.topicId,
    passageId: search.passageId,
    type: search.type,
    quizType: search.quizType,
    model: search.model,
    isActive: search.isActive,
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
    isFetching,
  } = useReadingQuestions(params)

  const updateSearch = (patch: Partial<ReadingQuestionsSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  }

  // Đổi filter luôn kéo về trang 1: trang hiện tại có thể vượt quá totalPages mới.
  // Sheet chi tiết đọc row từ trang đang tải nên cũng phải đóng theo.
  const applyFilter = (patch: Partial<ReadingQuestionsSearch>) =>
    updateSearch({ ...patch, page: undefined, questionId: undefined })

  const filters: ReadingQuestionsToolbarFilters = {
    q: search.q,
    cefrLevel: search.cefrLevel,
    type: search.type,
    quizType: search.quizType,
    model: search.model,
    isActive: search.isActive,
    passageId: search.passageId,
  }

  const hasActiveFilter =
    [
      filters.q,
      filters.cefrLevel,
      filters.type,
      filters.quizType,
      filters.model,
      filters.passageId,
    ].some(Boolean) || filters.isActive !== undefined

  const clearAllFilters = () =>
    applyFilter({
      q: undefined,
      cefrLevel: undefined,
      topicId: undefined,
      passageId: undefined,
      type: undefined,
      quizType: undefined,
      model: undefined,
      isActive: undefined,
    })

  const isEmpty = !isPending && items?.length === 0
  const selectedQuestion = items?.find(
    (question) => question.id === search.questionId
  )

  return (
    <>
      <PageHeader
        title="Câu hỏi đọc hiểu"
        description={
          total === undefined
            ? "Kho câu hỏi sinh từ bài đọc, lọc theo loại, cấp độ và model."
            : `${formatNumber(total)} câu khớp bộ lọc hiện tại.`
        }
        actions={
          <Button
            render={<Link to="/refill" search={{ tab: "reading-questions" }} />}
          >
            <IconStack2 stroke={1.5} data-icon="inline-start" />
            Sinh hàng loạt
          </Button>
        }
      />

      <ReadingQuestionsToolbar
        filters={filters}
        hasActiveFilter={hasActiveFilter}
        isRefreshing={isFetching}
        onSearchChange={(value) => applyFilter({ q: value })}
        onFilterChange={(patch) => applyFilter(patch)}
        onClearAll={clearAllFilters}
        onRefresh={() =>
          void queryClient.invalidateQueries({
            queryKey: getGetAdminReadingQuestionsQueryKey(),
          })
        }
      />

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
                  : 'Kho đang trống. Bấm "Sinh hàng loạt" ở trên hoặc chờ job nền chạy.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ReadingQuestionsTable
            items={items}
            sort={sort}
            isPending={isPending}
            isRefetching={isFetching && !isPending}
            selectedId={search.questionId}
            onSortChange={(value) => applyFilter({ sort: value })}
            onSelect={(questionId) => updateSearch({ questionId })}
          />
          <ReadingQuestionsPagination
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

      <ReadingQuestionDetailSheet
        question={selectedQuestion}
        onOpenChange={(open) => {
          if (!open) updateSearch({ questionId: undefined })
        }}
      />
    </>
  )
}
