import {
  IconAlertTriangle,
  IconCoins,
  IconCurrencyDollar,
  IconRepeat,
} from "@tabler/icons-react"

import { StatTile, StatTileGrid } from "@/components/common/stat-tile.tsx"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, formatPercent, formatUsd } from "@/lib/format.ts"

import { DASHBOARD_USAGE_RANGE_DAYS } from "../constants.ts"

export function OverviewStatTiles({
  totals,
  isPending,
}: {
  totals: {
    costUsd: number
    tokenIn: number
    tokenOut: number
    requestCount: number
    errorRate: number
  }
  isPending: boolean
}) {
  if (isPending) {
    return (
      <StatTileGrid className="grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-2xl" />
        ))}
      </StatTileGrid>
    )
  }

  return (
    <StatTileGrid className="grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Tổng chi phí"
        value={formatUsd(totals.costUsd)}
        hint={`${DASHBOARD_USAGE_RANGE_DAYS} ngày gần đây`}
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
        label="Tỷ lệ lỗi"
        value={formatPercent(totals.errorRate)}
        hint="Toàn bộ model"
        icon={IconAlertTriangle}
        tone={totals.errorRate > 0 ? "danger" : "default"}
      />
    </StatTileGrid>
  )
}
