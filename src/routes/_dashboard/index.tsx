import { createFileRoute } from "@tanstack/react-router"
import { IconDatabase } from "@tabler/icons-react"

import { getGetEnglishCronUsageQueryOptions } from "@/apis/english-cron-tracking/english-cron-tracking.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ModelErrorRateTable } from "@/features/dashboard/components/model-error-rate-table.tsx"
import { OverviewStatTiles } from "@/features/dashboard/components/overview-stat-tiles.tsx"
import { DASHBOARD_USAGE_RANGE_DAYS } from "@/features/dashboard/constants.ts"
import { useDashboardUsage } from "@/features/dashboard/hooks/use-dashboard-usage.ts"
import { usageRangeFrom } from "@/features/cron-runs/hooks/use-cron-usage.ts"

export const Route = createFileRoute("/_dashboard/")({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(
      getGetEnglishCronUsageQueryOptions({
        from: usageRangeFrom(DASHBOARD_USAGE_RANGE_DAYS).toISOString(),
        groupBy: "model",
      })
    ),
  component: OverviewPage,
})

function OverviewPage() {
  const {
    modelRows,
    totals,
    isPending: isUsagePending,
    isError: isUsageError,
    error: usageError,
    refetch: refetchUsage,
  } = useDashboardUsage()

  return (
    <>
      <PageHeader
        title="Bảng điều khiển"
        description="Chi phí AI, token, tỷ lệ lỗi theo model và tình trạng các cron job nền."
      />

      <div className="flex flex-col gap-4">
        <OverviewStatTiles totals={totals} isPending={isUsagePending} />

        <Card>
          <CardHeader>
            <CardTitle>
              <IconDatabase stroke={1.5} data-icon="inline-start" />
              Tỷ lệ lỗi theo model
            </CardTitle>
            <CardDescription>
              So sánh lượt gọi thành công/thất bại của từng model trong{" "}
              {DASHBOARD_USAGE_RANGE_DAYS} ngày gần đây.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModelErrorRateTable
              rows={modelRows}
              isPending={isUsagePending}
              isError={isUsageError}
              error={usageError}
              onRetry={() => void refetchUsage()}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
