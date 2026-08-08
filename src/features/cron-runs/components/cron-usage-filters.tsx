import { IconRefresh } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { UsageGroupBy } from "../constants.ts"
import {
  USAGE_GROUP_BY_LABELS,
  USAGE_GROUP_BY_VALUES,
  USAGE_RANGE_OPTIONS,
} from "../constants.ts"

export function CronUsageFilters({
  days,
  groupBy,
  isRefreshing,
  onDaysChange,
  onGroupByChange,
  onRefresh,
}: {
  days: number
  groupBy: UsageGroupBy
  isRefreshing: boolean
  onDaysChange: (value: number) => void
  onGroupByChange: (value: UsageGroupBy) => void
  onRefresh: () => void
}) {
  const rangeItems = Object.fromEntries(
    USAGE_RANGE_OPTIONS.map((option) => [String(option), `${option} ngày`])
  )
  const groupByItems = Object.fromEntries(
    USAGE_GROUP_BY_VALUES.map((value) => [value, USAGE_GROUP_BY_LABELS[value]])
  )

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="usage-range">Khoảng thời gian</Label>
        <Select
          items={rangeItems}
          value={String(days)}
          onValueChange={(value) => onDaysChange(Number(value))}
        >
          <SelectTrigger id="usage-range" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {USAGE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} ngày
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="usage-group-by">Nhóm theo</Label>
        <Select
          items={groupByItems}
          value={groupBy}
          onValueChange={(value) => onGroupByChange(value as UsageGroupBy)}
        >
          <SelectTrigger id="usage-group-by" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {USAGE_GROUP_BY_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {USAGE_GROUP_BY_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="ml-auto"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <IconRefresh stroke={1.5} data-icon="inline-start" />
        Làm mới
      </Button>
    </div>
  )
}
