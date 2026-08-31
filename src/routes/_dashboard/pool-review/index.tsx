import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { IconSearchOff, IconX } from "@tabler/icons-react"

import {
  getGetAdminPoolReviewsQueryKey,
  getGetAdminPoolReviewsQueryOptions,
} from "@/apis/admin-pool-review/admin-pool-review.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PoolReviewCardList } from "@/features/pool-review/components/pool-review-card-list.tsx"
import { PoolReviewsPagination } from "@/features/pool-review/components/pool-reviews-pagination.tsx"
import { PoolReviewsTable } from "@/features/pool-review/components/pool-reviews-table.tsx"
import { PoolReviewsToolbar } from "@/features/pool-review/components/pool-reviews-toolbar.tsx"
import type { PoolReviewsToolbarFilters } from "@/features/pool-review/components/pool-reviews-toolbar.tsx"
import { DEFAULT_POOL_REVIEW_SORT } from "@/features/pool-review/constants.ts"
import { usePoolReviews } from "@/features/pool-review/hooks/use-pool-reviews.ts"
import {
  parsePoolReviewListSearch,
  poolReviewListParams,
} from "@/features/pool-review/search.ts"
import type { PoolReviewListSearch } from "@/features/pool-review/search.ts"
import { formatNumber } from "@/lib/format.ts"

export const Route = createFileRoute("/_dashboard/pool-review/")({
  validateSearch: (search: Record<string, unknown>): PoolReviewListSearch =>
    parsePoolReviewListSearch(search),
  loaderDeps: ({ search }) => ({ params: poolReviewListParams(search) }),
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
  const params = poolReviewListParams(search)

  const {
    items,
    total,
    totalPages,
    pageSize,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = usePoolReviews(params)

  const updateSearch = (patch: Partial<PoolReviewListSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  }

  const applyFilter = (patch: Partial<PoolReviewListSearch>) =>
    updateSearch({ ...patch, page: undefined })

  const openReview = (reviewId: number) =>
    void navigate({
      to: "/pool-review/$reviewId",
      params: { reviewId: String(reviewId) },
      search,
    })

  const filters: PoolReviewsToolbarFilters = {
    q: search.q,
    status: search.status,
    verdict: search.verdict,
    quizType: search.quizType,
    engLevel: search.engLevel,
  }

  const hasActiveFilter =
    [
      filters.q,
      filters.status,
      filters.verdict,
      filters.quizType,
      filters.engLevel,
    ].some(Boolean) || search.poolQuestionRefId !== undefined

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
            poolQuestionRefId: undefined,
          })
        }
        onRefresh={() =>
          void queryClient.invalidateQueries({
            queryKey: getGetAdminPoolReviewsQueryKey(),
          })
        }
      />

      {search.poolQuestionRefId !== undefined ? (
        <div>
          <Badge variant="secondary" className="gap-1">
            Câu #{search.poolQuestionRefId}
            <button
              type="button"
              aria-label="Bỏ lọc câu"
              onClick={() => applyFilter({ poolQuestionRefId: undefined })}
            >
              <IconX stroke={1.5} className="size-3.5" />
            </button>
          </Badge>
        </div>
      ) : null}

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
            onSortChange={(value) => applyFilter({ sort: value })}
            onSelect={openReview}
          />
          <PoolReviewCardList
            items={items}
            isPending={isPending}
            isRefetching={isFetching && !isPending}
            onSelect={openReview}
          />
          <PoolReviewsPagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            total={total}
            onPageChange={(value) =>
              updateSearch({ page: value > 1 ? value : undefined })
            }
            onPageSizeChange={(value) => applyFilter({ pageSize: value })}
          />
        </>
      )}
    </>
  )
}
