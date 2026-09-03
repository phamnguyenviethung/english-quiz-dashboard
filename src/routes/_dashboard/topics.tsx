import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { IconSearchOff, IconTagsOff } from "@tabler/icons-react"

import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { CreateTopicDialog } from "@/features/topics/components/create-topic-dialog.tsx"
import { TopicsPagination } from "@/features/topics/components/topics-pagination.tsx"
import { TopicsTable } from "@/features/topics/components/topics-table.tsx"
import { TopicsToolbar } from "@/features/topics/components/topics-toolbar.tsx"
import {
  DEFAULT_TOPIC_SORT,
  PAGE_SIZE_OPTIONS,
  TOPIC_SORTS,
  TOPICS_PAGE_SIZE,
} from "@/features/topics/constants.ts"
import type { TopicsSort } from "@/features/topics/constants.ts"
import { useTopics } from "@/features/topics/hooks/use-topics.ts"
import { formatNumber } from "@/lib/format.ts"

interface TopicsSearch {
  q?: string
  isActive?: boolean
  sort?: TopicsSort
  page?: number
  pageSize?: number
}

export const Route = createFileRoute("/_dashboard/topics")({
  validateSearch: (search: Record<string, unknown>): TopicsSearch => {
    const q =
      typeof search.q === "string" && search.q.trim()
        ? search.q.trim().slice(0, 100)
        : undefined
    const isActive =
      search.isActive === true || search.isActive === "true"
        ? true
        : search.isActive === false || search.isActive === "false"
          ? false
          : undefined
    const sort = TOPIC_SORTS.find((value) => value === search.sort)
    const parsedPage = Number(search.page)
    const page =
      Number.isInteger(parsedPage) && parsedPage > 1 ? parsedPage : undefined
    const parsedPageSize = Number(search.pageSize)
    const pageSize = PAGE_SIZE_OPTIONS.find(
      (size) => size === parsedPageSize && size !== TOPICS_PAGE_SIZE
    )

    return {
      ...(q ? { q } : {}),
      ...(isActive === undefined ? {} : { isActive }),
      ...(sort ? { sort } : {}),
      ...(page ? { page } : {}),
      ...(pageSize ? { pageSize } : {}),
    }
  },
  component: TopicsPage,
})

function TopicsPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { topics, isPending, isError, error, refetch, isRefetching } =
    useTopics()

  const sort = search.sort ?? DEFAULT_TOPIC_SORT
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? TOPICS_PAGE_SIZE

  const updateSearch = (patch: Partial<TopicsSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  }

  const applyFilter = (patch: Partial<TopicsSearch>) =>
    updateSearch({ ...patch, page: undefined })

  const clearAllFilters = () =>
    applyFilter({
      q: undefined,
      isActive: undefined,
    })

  // Lọc và sắp xếp phía client
  const filteredTopics = useMemo(() => {
    let result = topics
    if (search.isActive !== undefined) {
      result = result.filter((t) => t.isActive === search.isActive)
    }
    if (search.q) {
      const query = search.q.toLowerCase()
      result = result.filter(
        (t) =>
          String(t.id).includes(query) ||
          t.name.toLowerCase().includes(query) ||
          (t.displayName && t.displayName.toLowerCase().includes(query)) ||
          (t.description && t.description.toLowerCase().includes(query))
      )
    }

    const getTime = (val: string | number | null | undefined) =>
      val ? new Date(val).getTime() : 0

    return [...result].sort((a, b) => {
      switch (sort) {
        case "id_asc":
          return a.id - b.id
        case "id_desc":
          return b.id - a.id
        case "name_asc":
          return a.name.localeCompare(b.name)
        case "name_desc":
          return b.name.localeCompare(a.name)
        case "created_asc":
          return getTime(a.createdAt) - getTime(b.createdAt)
        case "created_desc":
          return getTime(b.createdAt) - getTime(a.createdAt)
        default:
          return a.id - b.id
      }
    })
  }, [topics, search.isActive, search.q, sort])

  const total = filteredTopics.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const paginatedTopics = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredTopics.slice(start, start + pageSize)
  }, [filteredTopics, page, pageSize])

  const hasActiveFilter = Boolean(search.q) || search.isActive !== undefined
  const isEmpty = !isPending && topics.length === 0
  const isFilteredEmpty = !isPending && !isEmpty && filteredTopics.length === 0

  return (
    <>
      <PageHeader
        title="Chủ đề"
        description={
          isPending
            ? "Chủ đề dùng để phân loại câu hỏi khi tạo mới."
            : `${formatNumber(total)} chủ đề khớp bộ lọc hiện tại.`
        }
        actions={<CreateTopicDialog />}
      />

      <TopicsToolbar
        filters={{ q: search.q, isActive: search.isActive }}
        hasActiveFilter={hasActiveFilter}
        isRefreshing={isRefetching}
        onSearchChange={(value) => applyFilter({ q: value })}
        onFilterChange={(patch) => applyFilter(patch)}
        onClearAll={clearAllFilters}
        onRefresh={() => void refetch()}
      />

      {isError ? (
        <QueryError
          title="Không tải được danh sách chủ đề"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isEmpty ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconTagsOff stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Chưa có chủ đề nào</EmptyTitle>
            <EmptyDescription>
              Tạo chủ đề đầu tiên để bắt đầu phân loại câu hỏi theo từng nhóm nội
              dung.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateTopicDialog />
          </EmptyContent>
        </Empty>
      ) : isFilteredEmpty ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconSearchOff stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Không có chủ đề nào</EmptyTitle>
            <EmptyDescription>
              {search.q
                ? `Không có chủ đề nào khớp từ khoá "${search.q}". Thử từ khoá khác hoặc bỏ bớt điều kiện lọc.`
                : "Không có chủ đề nào khớp bộ lọc hiện tại. Thử bỏ bớt điều kiện lọc."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <TopicsTable
            topics={paginatedTopics}
            sort={sort}
            isPending={isPending}
            isRefetching={isRefetching}
            onSortChange={(value) => applyFilter({ sort: value })}
          />
          <TopicsPagination
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
