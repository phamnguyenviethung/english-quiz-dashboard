import {
  IconChartBar,
  IconCoins,
  IconCurrencyDollar,
  IconRepeat,
} from "@tabler/icons-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { QueryError } from "@/components/common/query-error.tsx"
import { StatTile, StatTileGrid } from "@/components/common/stat-tile.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatNumber, formatUsd } from "@/lib/format.ts"

import type { UsageGroupBy } from "../constants.ts"
import { useCronUsage } from "../hooks/use-cron-usage.ts"
import { CronUsageFilters } from "./cron-usage-filters.tsx"

const chartConfig = {
  costUsd: { label: "Chi phí", color: "var(--chart-1)" },
} satisfies ChartConfig

/** "2026-08-08" → "08/08" cho trục X đỡ chật. */
function shortDayLabel(bucket: string): string {
  const parts = bucket.split("-")
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : bucket
}

export function CronUsageSection({
  days,
  groupBy,
  onDaysChange,
  onGroupByChange,
}: {
  days: number
  groupBy: UsageGroupBy
  onDaysChange: (value: number) => void
  onGroupByChange: (value: UsageGroupBy) => void
}) {
  const { items, totals, isPending, isError, error, refetch, isRefetching } =
    useCronUsage({ days, groupBy })

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <IconChartBar stroke={1.5} data-icon="inline-start" />
          Chi phí AI
        </CardTitle>
        <CardDescription>
          Token và chi phí thực tế của các lượt gọi model trong job nền. Lượt
          gọi bằng model chưa có giá cache được tính là 0.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <CronUsageFilters
          days={days}
          groupBy={groupBy}
          isRefreshing={isRefetching}
          onDaysChange={onDaysChange}
          onGroupByChange={onGroupByChange}
          onRefresh={() => void refetch()}
        />

        {isError ? (
          <QueryError
            title="Không tải được dữ liệu chi phí"
            error={error}
            onRetry={() => void refetch()}
          />
        ) : isPending ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : items.length === 0 ? (
          <Empty className="rounded-2xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconCurrencyDollar stroke={1.5} />
              </EmptyMedia>
              <EmptyTitle>Chưa có lượt gọi model nào</EmptyTitle>
              <EmptyDescription>
                Không có lượt gọi AI nào trong {days} ngày gần đây.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <StatTileGrid className="grid-cols-2 lg:grid-cols-4">
              <StatTile
                label="Tổng chi phí"
                value={formatUsd(totals.costUsd)}
                hint={`${days} ngày gần đây`}
                icon={IconCurrencyDollar}
              />
              <StatTile
                label="Tổng token"
                value={formatNumber(totals.tokenIn + totals.tokenOut)}
                hint={`${formatNumber(totals.tokenIn)} vào / ${formatNumber(totals.tokenOut)} ra`}
                icon={IconCoins}
              />
              <StatTile
                label="Lượt gọi model"
                value={formatNumber(totals.requestCount)}
                icon={IconRepeat}
              />
              <StatTile
                label="Chi phí trung bình"
                value={formatUsd(
                  totals.requestCount === 0
                    ? 0
                    : totals.costUsd / totals.requestCount
                )}
                hint="Mỗi lượt gọi"
                icon={IconChartBar}
              />
            </StatTileGrid>

            {groupBy === "day" ? (
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-64 w-full"
              >
                <BarChart accessibilityLayer data={items}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="bucket"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={shortDayLabel}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={72}
                    tickFormatter={(value: number) => formatUsd(value)}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatUsd(Number(value))}
                      />
                    }
                  />
                  <Bar
                    dataKey="costUsd"
                    fill="var(--color-costUsd)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="overflow-x-auto rounded-2xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Lượt gọi</TableHead>
                      <TableHead className="text-right">Token</TableHead>
                      <TableHead className="text-right">Chi phí</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.bucket}>
                        <TableCell className="font-mono text-xs">
                          {item.bucket}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(item.requestCount)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(item.tokenIn + item.tokenOut)}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatUsd(item.costUsd)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
