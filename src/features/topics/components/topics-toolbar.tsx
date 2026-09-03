import { useEffect, useState } from "react"
import {
  IconFilterOff,
  IconRefresh,
  IconSearch,
  IconX,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"
import { cn } from "@/lib/utils"

import {
  ACTIVE_VALUE,
  ALL_STATUS_LABEL,
  ALL_STATUS_VALUE,
  FILTER_PILL,
  FILTER_PILL_ACTIVE,
  FILTER_PILL_LABEL,
  INACTIVE_VALUE,
} from "../constants.ts"

export interface TopicsToolbarFilters {
  q: string | undefined
  isActive: boolean | undefined
}

export function TopicsToolbar({
  filters,
  hasActiveFilter,
  isRefreshing,
  onSearchChange,
  onFilterChange,
  onClearAll,
  onRefresh,
  children,
}: {
  filters: TopicsToolbarFilters
  hasActiveFilter: boolean
  isRefreshing: boolean
  onSearchChange: (value: string | undefined) => void
  onFilterChange: (patch: Partial<TopicsToolbarFilters>) => void
  onClearAll: () => void
  onRefresh: () => void
  children?: React.ReactNode
}) {
  const [draft, setDraft] = useState(filters.q ?? "")
  const debouncedDraft = useDebouncedValue(draft, 350)

  useEffect(() => {
    const trimmed = debouncedDraft.trim()
    if (trimmed !== (filters.q ?? "")) onSearchChange(trimmed || undefined)
  }, [debouncedDraft])

  useEffect(() => {
    if (draft.trim() === (filters.q ?? "")) return
    setDraft(filters.q ?? "")
  }, [filters.q])

  const isSearchPending = draft.trim() !== (filters.q ?? "")

  const statusItems = {
    [ALL_STATUS_VALUE]: ALL_STATUS_LABEL,
    [ACTIVE_VALUE]: "Đang bật",
    [INACTIVE_VALUE]: "Đã tắt",
  }

  const statusValue =
    filters.isActive === undefined
      ? ALL_STATUS_VALUE
      : filters.isActive
        ? ACTIVE_VALUE
        : INACTIVE_VALUE

  return (
    <div className="sticky top-16 z-10 flex flex-col gap-3 rounded-2xl border bg-background px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:max-w-md">
          <InputGroupAddon align="inline-start">
            {isSearchPending || isRefreshing ? (
              <Spinner className="size-4 text-muted-foreground" />
            ) : (
              <IconSearch stroke={1.5} />
            )}
          </InputGroupAddon>
          <InputGroupInput
            id="topics-search"
            aria-label="Tìm chủ đề"
            placeholder="Tìm theo tên, tên hiển thị, mô tả hoặc ID..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          {draft ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label="Xoá từ khoá"
                onClick={() => setDraft("")}
              >
                <IconX stroke={1.5} />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>

        <div className="ml-auto flex items-center gap-2">
          {children}
          <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            <IconRefresh stroke={1.5} data-icon="inline-start" />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={statusItems}
          value={statusValue}
          onValueChange={(value) =>
            onFilterChange({
              isActive:
                value === ALL_STATUS_VALUE
                  ? undefined
                  : value === ACTIVE_VALUE,
            })
          }
        >
          <SelectTrigger
            aria-label="Lọc theo trạng thái"
            className={cn(
              FILTER_PILL,
              filters.isActive !== undefined && FILTER_PILL_ACTIVE
            )}
          >
            <span className={FILTER_PILL_LABEL}>Trạng thái:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS_VALUE}>Tất cả trạng thái</SelectItem>
            <SelectItem value={ACTIVE_VALUE}>Đang bật</SelectItem>
            <SelectItem value={INACTIVE_VALUE}>Đã tắt</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilter ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <IconFilterOff stroke={1.5} className="size-4" />
            Xoá lọc
          </Button>
        ) : null}
      </div>
    </div>
  )
}
