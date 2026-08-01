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

import {
  ALL_STATUS_LABEL,
  ALL_STATUS_VALUE,
  CRON_LIMIT_OPTIONS,
  getCronStatusMeta,
} from "../constants.ts"

export function CronRunsFilters({
  limit,
  status,
  statuses,
  isRefreshing,
  onLimitChange,
  onStatusChange,
  onRefresh,
}: {
  limit: number
  status: string
  statuses: string[]
  isRefreshing: boolean
  onLimitChange: (value: number) => void
  onStatusChange: (value: string) => void
  onRefresh: () => void
}) {
  const limitItems = Object.fromEntries(
    CRON_LIMIT_OPTIONS.map((option) => [String(option), `${option} lượt`])
  )
  const statusItems = {
    [ALL_STATUS_VALUE]: ALL_STATUS_LABEL,
    ...Object.fromEntries(
      statuses.map((entry) => [entry, getCronStatusMeta(entry).label])
    ),
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="cron-limit">Số lượt tải về</Label>
        <Select
          items={limitItems}
          value={String(limit)}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger id="cron-limit" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CRON_LIMIT_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} lượt
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cron-status">Trạng thái</Label>
        <Select
          items={statusItems}
          value={status}
          onValueChange={(value) => onStatusChange(value ?? ALL_STATUS_VALUE)}
        >
          <SelectTrigger id="cron-status" className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS_VALUE}>{ALL_STATUS_LABEL}</SelectItem>
            {statuses.map((entry) => (
              <SelectItem key={entry} value={entry}>
                {getCronStatusMeta(entry).label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Lọc trên dữ liệu đã tải, API không hỗ trợ lọc theo trạng thái.
        </p>
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
