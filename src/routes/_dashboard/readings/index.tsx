import { useState } from "react"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { IconSearchOff, IconSparkles, IconStack2 } from "@tabler/icons-react"

import {
  getGetAdminReadingsQueryKey,
  getGetAdminReadingsQueryOptions,
} from "@/apis/admin-readings/admin-readings.ts"
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
  DEFAULT_READING_SORT,
  PAGE_SIZE_OPTIONS,
  READINGS_PAGE_SIZE,
  READING_SORTS,
} from "@/features/readings/constants.ts"
import { ReadingDetailSheet } from "@/features/readings/components/reading-detail-sheet.tsx"
import { ReadingGenerateDialog } from "@/features/readings/components/reading-generate-dialog.tsx"
import { ReadingsPagination } from "@/features/readings/components/readings-pagination.tsx"
import { ReadingsTable } from "@/features/readings/components/readings-table.tsx"
import { ReadingsToolbar } from "@/features/readings/components/readings-toolbar.tsx"
import type { ReadingsToolbarFilters } from "@/features/readings/components/readings-toolbar.tsx"
import {
  buildReadingsParams,
  useReadings,
} from "@/features/readings/hooks/use-readings.ts"
import type { ReadingPassagesSort } from "@/features/readings/types.ts"
import { ENG_LEVELS } from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"
import { formatNumber } from "@/lib/format.ts"

interface ReadingsSearch {
  q?: string
  cefrLevel?: EngLevel
  topicId?: number
  model?: string
  isActive?: boolean
  createdFrom?: string
  createdTo?: string
  sort?: ReadingPassagesSort
  page?: number
  pageSize?: number
  readingId?: number
}

function parseIsoParam(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined
  return Number.isNaN(Date.parse(value)) ? undefined : value
}

function parsePositiveInt(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export const Route = createFileRoute("/_dashboard/readings/")({
  validateSearch: (search: Record<string, unknown>): ReadingsSearch => {
    const q =
      typeof search.q === "string" && search.q.trim()
        ? search.q.trim().slice(0, 100)
        : undefined
    const cefrLevel = ENG_LEVELS.find((level) => level === search.cefrLevel)
    const model =
      typeof search.model === "string" && search.model.trim()
        ? search.model.trim()
        : undefined
    const topicId = parsePositiveInt(search.topicId)
    const isActive =
      search.isActive === true || search.isActive === "true"
        ? true
        : search.isActive === false || search.isActive === "false"
          ? false
          : undefined
    const createdFrom = parseIsoParam(search.createdFrom)
    const createdTo = parseIsoParam(search.createdTo)
    const sort = READING_SORTS.find((value) => value === search.sort)
    const parsedPage = Number(search.page)
    const page =
      Number.isInteger(parsedPage) && parsedPage > 1 ? parsedPage : undefined
    const parsedPageSize = Number(search.pageSize)
    const pageSize = PAGE_SIZE_OPTIONS.find(
      (size) => size === parsedPageSize && size !== READINGS_PAGE_SIZE
    )
    const readingId = parsePositiveInt(search.readingId)

    return {
      ...(q ? { q } : {}),
      ...(cefrLevel ? { cefrLevel } : {}),
      ...(topicId ? { topicId } : {}),
      ...(model ? { model } : {}),
      ...(isActive === undefined ? {} : { isActive }),
      ...(createdFrom ? { createdFrom } : {}),
      ...(createdTo ? { createdTo } : {}),
      ...(sort ? { sort } : {}),
      ...(page ? { page } : {}),
      ...(pageSize ? { pageSize } : {}),
      ...(readingId ? { readingId } : {}),
    }
  },
  loaderDeps: ({ search }) => ({
    params: buildReadingsParams({
      q: search.q,
      cefrLevel: search.cefrLevel,
      topicId: search.topicId,
      noTopic: false,
      model: search.model,
      isActive: search.isActive,
      createdFrom: search.createdFrom,
      createdTo: search.createdTo,
      // Phải khớp default dùng trong component, nếu không params ở loader và ở
      // component lệch nhau => query key khác nhau => prefetch không hit cache lúc SSR.
      sort: search.sort ?? DEFAULT_READING_SORT,
      page: search.page ?? 1,
      pageSize: search.pageSize ?? READINGS_PAGE_SIZE,
    }),
  }),
  loader: ({ context, deps }) =>
    context.queryClient.prefetchQuery(
      getGetAdminReadingsQueryOptions(deps.params)
    ),
  component: ReadingsPage,
})

function ReadingsPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()
  const [generateOpen, setGenerateOpen] = useState(false)

  const sort = search.sort ?? DEFAULT_READING_SORT
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? READINGS_PAGE_SIZE

  const params = buildReadingsParams({
    q: search.q,
    cefrLevel: search.cefrLevel,
    topicId: search.topicId,
    noTopic: false,
    model: search.model,
    isActive: search.isActive,
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
  } = useReadings(params)

  const updateSearch = (patch: Partial<ReadingsSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  }

  // Đổi filter luôn kéo về trang 1: trang hiện tại có thể vượt quá totalPages mới.
  // Sheet chi tiết đọc row từ trang đang tải nên cũng phải đóng theo.
  const applyFilter = (patch: Partial<ReadingsSearch>) =>
    updateSearch({ ...patch, page: undefined, readingId: undefined })

  const filters: ReadingsToolbarFilters = {
    q: search.q,
    cefrLevel: search.cefrLevel,
    topicId: search.topicId,
    model: search.model,
    isActive: search.isActive,
  }

  const hasActiveFilter =
    [filters.q, filters.cefrLevel, filters.topicId, filters.model].some(
      Boolean
    ) || filters.isActive !== undefined

  const clearAllFilters = () =>
    applyFilter({
      q: undefined,
      cefrLevel: undefined,
      topicId: undefined,
      model: undefined,
      isActive: undefined,
      createdFrom: undefined,
      createdTo: undefined,
    })

  const isEmpty = !isPending && items?.length === 0
  const selectedPassage = items?.find(
    (passage) => passage.id === search.readingId
  )

  return (
    <>
      <PageHeader
        title="Bài đọc"
        description={
          total === undefined
            ? "Kho bài đọc sinh bằng AI, lọc theo cấp độ, chủ đề và model."
            : `${formatNumber(total)} bài khớp bộ lọc hiện tại.`
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setGenerateOpen(true)}>
              <IconSparkles stroke={1.5} data-icon="inline-start" />
              Tạo thử 1 bài
            </Button>
            <Button render={<Link to="/refill" search={{ tab: "readings" }} />}>
              <IconStack2 stroke={1.5} data-icon="inline-start" />
              Sinh hàng loạt
            </Button>
          </>
        }
      />

      <ReadingsToolbar
        filters={filters}
        hasActiveFilter={hasActiveFilter}
        isRefreshing={isRefetching}
        onSearchChange={(value) => applyFilter({ q: value })}
        onFilterChange={(patch) => applyFilter(patch)}
        onClearAll={clearAllFilters}
        onRefresh={() =>
          void queryClient.invalidateQueries({
            queryKey: getGetAdminReadingsQueryKey(),
          })
        }
      />

      {isError ? (
        <QueryError
          title="Không tải được danh sách bài đọc"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isEmpty ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconSearchOff stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Không có bài đọc nào</EmptyTitle>
            <EmptyDescription>
              {search.q
                ? `Không có bài nào khớp từ khoá "${search.q}". Thử từ khoá khác hoặc bỏ bớt điều kiện lọc.`
                : hasActiveFilter
                  ? "Không có bài nào khớp bộ lọc hiện tại. Thử bỏ bớt điều kiện lọc."
                  : 'Kho đang trống. Bấm "Sinh hàng loạt" ở trên hoặc chờ job nền chạy.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ReadingsTable
            items={items}
            sort={sort}
            isPending={isPending}
            isRefetching={isRefetching}
            selectedId={search.readingId}
            onSortChange={(value) => applyFilter({ sort: value })}
            onSelect={(readingId) => updateSearch({ readingId })}
          />
          <ReadingsPagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            total={total}
            onPageChange={(value) =>
              updateSearch({
                page: value > 1 ? value : undefined,
                readingId: undefined,
              })
            }
            onPageSizeChange={(value) => applyFilter({ pageSize: value })}
          />
        </>
      )}

      <ReadingDetailSheet
        passage={selectedPassage}
        onOpenChange={(open) => {
          if (!open) updateSearch({ readingId: undefined })
        }}
      />

      <ReadingGenerateDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
      />
    </>
  )
}
