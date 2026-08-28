import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { IconSearchOff } from "@tabler/icons-react"

import {
  getGetAdminPoolReviewsQueryKey,
  getGetAdminPoolReviewsQueryOptions,
} from "@/apis/admin-pool-review/admin-pool-review.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PoolReviewDetailSheet } from "@/features/pool-review/components/pool-review-detail-sheet.tsx"
import { PoolReviewsPagination } from "@/features/pool-review/components/pool-reviews-pagination.tsx"
import { PoolReviewsTable } from "@/features/pool-review/components/pool-reviews-table.tsx"
import { PoolReviewsToolbar } from "@/features/pool-review/components/pool-reviews-toolbar.tsx"
import type { PoolReviewsToolbarFilters } from "@/features/pool-review/components/pool-reviews-toolbar.tsx"
import {
  DEFAULT_POOL_REVIEW_SORT,
  PAGE_SIZE_OPTIONS,
  POOL_REVIEW_SORTS,
  REVIEWS_PAGE_SIZE,
  REVIEW_STATUS_META,
  REVIEW_VERDICT_META,
} from "@/features/pool-review/constants.ts"
import {
  buildPoolReviewsParams,
  usePoolReviews,
} from "@/features/pool-review/hooks/use-pool-reviews.ts"
import type {
  PoolReviewsParams,
  PoolReviewsSort,
} from "@/features/pool-review/types.ts"
import { ENG_LEVELS, QUIZ_TYPES } from "@/features/quiz/constants.ts"
import type { EngLevel, QuizType } from "@/features/quiz/types.ts"
import { formatNumber } from "@/lib/format.ts"

type ReviewStatus = NonNullable<PoolReviewsParams["status"]>
type ReviewVerdict = NonNullable<PoolReviewsParams["verdict"]>

interface PoolReviewSearch {
  status?: ReviewStatus
  verdict?: ReviewVerdict
  quizType?: QuizType
  engLevel?: EngLevel
  q?: string
  sort?: PoolReviewsSort
  page?: number
  pageSize?: number
  reviewId?: number
}

function parsePositiveInt(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export const Route = createFileRoute("/_dashboard/pool-review/")({
  validateSearch: (search: Record<string, unknown>): PoolReviewSearch => {
    const status = Object.hasOwn(REVIEW_STATUS_META, String(search.status))
      ? (search.status as ReviewStatus)
      : undefined
    const verdict = Object.hasOwn(REVIEW_VERDICT_META, String(search.verdict))
      ? (search.verdict as ReviewVerdict)
      : undefined
    const quizType = QUIZ_TYPES.find((type) => type === search.quizType)
    const engLevel = ENG_LEVELS.find((level) => level === search.engLevel)
    const q =
      typeof search.q === "string" && search.q.trim()
        ? search.q.trim().slice(0, 100)
        : undefined
    const sort = POOL_REVIEW_SORTS.find((value) => value === search.sort)
    const parsedPage = Number(search.page)
    const page =
      Number.isInteger(parsedPage) && parsedPage > 1 ? parsedPage : undefined
    const parsedPageSize = Number(search.pageSize)
    const pageSize = PAGE_SIZE_OPTIONS.find(
      (size) => size === parsedPageSize && size !== REVIEWS_PAGE_SIZE
    )
    const reviewId = parsePositiveInt(search.reviewId)

    return {
      ...(status ? { status } : {}),
      ...(verdict ? { verdict } : {}),
      ...(quizType ? { quizType } : {}),
      ...(engLevel ? { engLevel } : {}),
      ...(q ? { q } : {}),
      ...(sort ? { sort } : {}),
      ...(page ? { page } : {}),
      ...(pageSize ? { pageSize } : {}),
      ...(reviewId ? { reviewId } : {}),
    }
  },
  loaderDeps: ({ search }) => ({
    params: buildPoolReviewsParams({
      status: search.status,
      verdict: search.verdict,
      quizType: search.quizType,
      engLevel: search.engLevel,
      topicId: undefined,
      poolQuestionRefId: undefined,
      q: search.q,
      sort: search.sort ?? DEFAULT_POOL_REVIEW_SORT,
      page: search.page ?? 1,
      pageSize: search.pageSize ?? REVIEWS_PAGE_SIZE,
    }),
  }),
  loader: ({ context, deps }) =>
    context.queryClient.prefetchQuery(
      getGetAdminPoolReviewsQueryOptions(deps.params)
    ),
  component: PoolReviewPage,
})

function PoolReviewPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()

  const sort = search.sort ?? DEFAULT_POOL_REVIEW_SORT
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? REVIEWS_PAGE_SIZE

  const params = buildPoolReviewsParams({
    status: search.status,
    verdict: search.verdict,
    quizType: search.quizType,
    engLevel: search.engLevel,
    topicId: undefined,
    poolQuestionRefId: undefined,
    q: search.q,
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
  } = usePoolReviews(params)

  const updateSearch = (patch: Partial<PoolReviewSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  }

  const applyFilter = (patch: Partial<PoolReviewSearch>) =>
    updateSearch({ ...patch, page: undefined, reviewId: undefined })

  const filters: PoolReviewsToolbarFilters = {
    q: search.q,
    status: search.status,
    verdict: search.verdict,
    quizType: search.quizType,
    engLevel: search.engLevel,
  }

  const hasActiveFilter = [
    filters.q,
    filters.status,
    filters.verdict,
    filters.quizType,
    filters.engLevel,
  ].some(Boolean)

  const isEmpty = !isPending && items?.length === 0

  return (
    <>
      <PageHeader
        title="Duyệt câu hỏi AI"
        description={
          total === undefined
            ? "Kết quả AI rà soát câu hỏi trong pool, chờ admin duyệt để ghi đè dữ liệu."
            : `${formatNumber(total)} review khớp bộ lọc hiện tại.`
        }
      />

      <PoolReviewsToolbar
        filters={filters}
        hasActiveFilter={hasActiveFilter}
        isRefreshing={isFetching}
        onSearchChange={(value) => applyFilter({ q: value })}
        onFilterChange={(patch) => applyFilter(patch)}
        onClearAll={() =>
          applyFilter({
            q: undefined,
            status: undefined,
            verdict: undefined,
            quizType: undefined,
            engLevel: undefined,
          })
        }
        onRefresh={() =>
          void queryClient.invalidateQueries({
            queryKey: getGetAdminPoolReviewsQueryKey(),
          })
        }
      />

      {isError ? (
        <QueryError
          title="Không tải được danh sách review"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isEmpty ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconSearchOff stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Chưa có review nào</EmptyTitle>
            <EmptyDescription>
              {hasActiveFilter
                ? "Không có review nào khớp bộ lọc. Thử bỏ bớt điều kiện."
                : 'Vào "Kho câu hỏi", chọn câu và bấm "Gửi AI review" để tạo review.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <PoolReviewsTable
            items={items}
            sort={sort}
            isPending={isPending}
            isRefetching={isFetching && !isPending}
            selectedId={search.reviewId}
            onSortChange={(value) => applyFilter({ sort: value })}
            onSelect={(reviewId) => updateSearch({ reviewId })}
          />
          <PoolReviewsPagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            total={total}
            onPageChange={(value) =>
              updateSearch({
                page: value > 1 ? value : undefined,
                reviewId: undefined,
              })
            }
            onPageSizeChange={(value) => applyFilter({ pageSize: value })}
          />
        </>
      )}

      <PoolReviewDetailSheet
        reviewId={search.reviewId}
        onOpenChange={(open) => {
          if (!open) updateSearch({ reviewId: undefined })
        }}
      />
    </>
  )
}
