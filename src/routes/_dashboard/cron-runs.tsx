import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { IconClockOff } from "@tabler/icons-react"

import { getGetEnglishCronRunsQueryOptions } from "@/apis/english-cron-tracking/english-cron-tracking.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { CronRunDetailSheet } from "@/features/cron-runs/components/cron-run-detail-sheet.tsx"
import { CronRunsFilters } from "@/features/cron-runs/components/cron-runs-filters.tsx"
import { CronRunsTable } from "@/features/cron-runs/components/cron-runs-table.tsx"
import {
  ALL_STATUS_VALUE,
  CRON_LIMIT_OPTIONS,
  DEFAULT_CRON_LIMIT,
} from "@/features/cron-runs/constants.ts"
import { useCronRuns } from "@/features/cron-runs/hooks/use-cron-runs.ts"

interface CronRunsSearch {
  limit?: number
  status?: string
  runId?: string
}

export const Route = createFileRoute("/_dashboard/cron-runs")({
  validateSearch: (search: Record<string, unknown>): CronRunsSearch => {
    const limit = CRON_LIMIT_OPTIONS.find(
      (option) => option === Number(search.limit)
    )
    const status =
      typeof search.status === "string" && search.status
        ? search.status
        : undefined
    const runId =
      typeof search.runId === "string" && search.runId
        ? search.runId
        : undefined

    return {
      ...(limit ? { limit } : {}),
      ...(status ? { status } : {}),
      ...(runId ? { runId } : {}),
    }
  },
  loaderDeps: ({ search }) => ({ limit: search.limit ?? DEFAULT_CRON_LIMIT }),
  loader: ({ context, deps }) =>
    context.queryClient.prefetchQuery(
      getGetEnglishCronRunsQueryOptions({ limit: deps.limit })
    ),
  component: CronRunsPage,
})

function CronRunsPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const limit = search.limit ?? DEFAULT_CRON_LIMIT
  const status = search.status ?? ALL_STATUS_VALUE

  const { runs, statuses, isPending, isError, error, refetch, isRefetching } =
    useCronRuns({ limit, status })

  const updateSearch = (patch: Partial<CronRunsSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  }

  return (
    <>
      <PageHeader
        title="Lịch sử cron"
        description="Các lượt chạy job nền: số bucket xử lý, câu hỏi sinh ra và lỗi phát sinh."
      />

      <CronRunsFilters
        limit={limit}
        status={status}
        statuses={statuses}
        isRefreshing={isRefetching}
        onLimitChange={(value) => updateSearch({ limit: value })}
        onStatusChange={(value) =>
          updateSearch({
            status: value === ALL_STATUS_VALUE ? undefined : value,
          })
        }
        onRefresh={() => void refetch()}
      />

      {isError ? (
        <QueryError
          title="Không tải được lịch sử cron"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : !isPending && runs.length === 0 ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconClockOff stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Không có lượt chạy nào</EmptyTitle>
            <EmptyDescription>
              {status === ALL_STATUS_VALUE
                ? "Chưa có job nền nào chạy, hoặc lịch sử đã bị dọn."
                : "Không có lượt chạy nào khớp trạng thái đang lọc."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <CronRunsTable
          runs={runs}
          isPending={isPending}
          selectedRunId={search.runId}
          onSelect={(runId) => updateSearch({ runId })}
        />
      )}

      <CronRunDetailSheet
        runId={search.runId}
        onOpenChange={(open) => {
          if (!open) updateSearch({ runId: undefined })
        }}
      />
    </>
  )
}
