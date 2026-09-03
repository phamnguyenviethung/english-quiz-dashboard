import {
  IconAlertTriangle,
  IconBook,
  IconClockBolt,
  IconHandClick,
  IconSearch,
  IconX,
} from "@tabler/icons-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type ModelFilterTab =
  "all" | "active" | "schedule" | "manual" | "reading" | "inactive"

export interface ModelFilterCounts {
  total: number
  active: number
  schedule: number
  manual: number
  reading: number
  inactive: number
}

interface AiModelsFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  activeTab: ModelFilterTab
  onTabChange: (tab: ModelFilterTab) => void
  counts: ModelFilterCounts
  className?: string
}

export function AiModelsFilterBar({
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  counts,
  className,
}: AiModelsFilterBarProps) {
  const tabs: Array<{
    key: ModelFilterTab
    label: string
    count: number
    dotColor?: string
    icon?: typeof IconClockBolt
    warningHint?: string
  }> = [
    {
      key: "all",
      label: "Tất cả",
      count: counts.total,
    },
    {
      key: "active",
      label: "Đang bật",
      count: counts.active,
      dotColor: "bg-emerald-500",
      warningHint:
        counts.active === 0 ? "Chưa có model nào đang hoạt động" : undefined,
    },
    {
      key: "schedule",
      label: "Tự động",
      count: counts.schedule,
      icon: IconClockBolt,
      warningHint:
        counts.schedule === 0
          ? "Cron tự động không có model nào để chọn!"
          : undefined,
    },
    {
      key: "manual",
      label: "Thủ công",
      count: counts.manual,
      icon: IconHandClick,
      warningHint:
        counts.manual === 0
          ? "Sinh câu hỏi thủ công không có model nào để chọn!"
          : undefined,
    },
    {
      key: "reading",
      label: "Bài đọc",
      count: counts.reading,
      icon: IconBook,
    },
    {
      key: "inactive",
      label: "Đã tắt",
      count: counts.inactive,
      dotColor: "bg-zinc-400 dark:bg-zinc-500",
    },
  ]

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Search Input */}
      <div className="relative flex-1">
        <InputGroup className="h-10 rounded-xl bg-background/80 shadow-2xs">
          <InputGroupAddon className="text-muted-foreground">
            <IconSearch className="size-4" stroke={1.5} />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên model, provider hoặc model ID..."
            className="text-sm"
          />
          {search ? (
            <InputGroupAddon className="pr-1.5">
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Xoá tìm kiếm"
              >
                <IconX className="size-3.5" stroke={2} />
              </button>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </div>

      {/* Filter Pills with horizontal scroll on mobile */}
      <div className="-mb-1 flex [scrollbar-width:none] items-center gap-1.5 overflow-x-auto pb-1 select-none [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.key
          const Icon = tab.icon

          const pill = (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "group relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                isSelected
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.dotColor ? (
                <span
                  className={cn("size-1.5 shrink-0 rounded-full", tab.dotColor)}
                />
              ) : Icon ? (
                <Icon className="size-3.5 shrink-0" stroke={1.5} />
              ) : null}

              <span>{tab.label}</span>

              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] leading-none font-semibold tabular-nums",
                  isSelected
                    ? "bg-background/20 text-background"
                    : "bg-background/80 text-muted-foreground group-hover:text-foreground"
                )}
              >
                {tab.count}
              </span>

              {tab.warningHint && tab.count === 0 ? (
                <IconAlertTriangle
                  className="size-3.5 shrink-0 text-amber-500 dark:text-amber-400"
                  stroke={2}
                />
              ) : null}
            </button>
          )

          if (tab.warningHint && tab.count === 0) {
            return (
              <Tooltip key={tab.key}>
                <TooltipTrigger render={pill} />
                <TooltipContent className="text-xs">
                  {tab.warningHint}
                </TooltipContent>
              </Tooltip>
            )
          }

          return pill
        })}
      </div>
    </div>
  )
}
