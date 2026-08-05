import { IconCalendar } from "@tabler/icons-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import {
  FILTER_PILL,
  FILTER_PILL_ACTIVE,
  FILTER_PILL_LABEL,
} from "../constants.ts"

export interface PoolDateRange {
  createdFrom: string | undefined
  createdTo: string | undefined
}

/** Người dùng chọn theo ngày, API nhận ISO date-time → mở rộng ra trọn ngày. */
function toStartOfDayIso(date: Date): string {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start.toISOString()
}

function toEndOfDayIso(date: Date): string {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end.toISOString()
}

function parseIso(value: string | undefined): Date | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const dayFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export function formatDateRangeLabel({
  createdFrom,
  createdTo,
}: PoolDateRange): string | undefined {
  const from = parseIso(createdFrom)
  const to = parseIso(createdTo)
  if (!from && !to) return undefined
  if (from && to)
    return `${dayFormatter.format(from)} → ${dayFormatter.format(to)}`
  if (from) return `từ ${dayFormatter.format(from)}`
  return `đến ${dayFormatter.format(to)}`
}

function buildPresetRange(days: number): PoolDateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - (days - 1))
  return { createdFrom: toStartOfDayIso(from), createdTo: toEndOfDayIso(to) }
}

export function PoolDateRangeFilter({
  value,
  onChange,
}: {
  value: PoolDateRange
  onChange: (range: PoolDateRange) => void
}) {
  const selected: DateRange | undefined = (() => {
    const from = parseIso(value.createdFrom)
    const to = parseIso(value.createdTo)
    return from || to ? { from, to } : undefined
  })()

  const rangeLabel = formatDateRangeLabel(value)
  const isActive = rangeLabel !== undefined

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            aria-label="Lọc theo ngày tạo"
            className={cn(
              FILTER_PILL,
              "font-normal",
              isActive && FILTER_PILL_ACTIVE
            )}
          >
            <IconCalendar stroke={1.5} data-icon="inline-start" />
            <span className={FILTER_PILL_LABEL}>Ngày tạo:</span>
            <span className="truncate">{rangeLabel ?? "Mọi lúc"}</span>
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(buildPresetRange(7))}
          >
            7 ngày qua
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(buildPresetRange(30))}
          >
            30 ngày qua
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!value.createdFrom && !value.createdTo}
            onClick={() =>
              onChange({ createdFrom: undefined, createdTo: undefined })
            }
          >
            Bỏ chọn
          </Button>
        </div>

        <Calendar
          mode="range"
          selected={selected}
          defaultMonth={selected?.from}
          onSelect={(range) =>
            onChange({
              createdFrom: range?.from
                ? toStartOfDayIso(range.from)
                : undefined,
              createdTo: range?.to ? toEndOfDayIso(range.to) : undefined,
            })
          }
        />
      </PopoverContent>
    </Popover>
  )
}
