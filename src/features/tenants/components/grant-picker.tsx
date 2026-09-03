import { useEffect, useMemo, useState } from "react"
import {
  IconChecklist,
  IconDeviceFloppy,
  IconRotate2,
  IconSearch,
  IconX,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"
import { cn } from "@/lib/utils"

export interface GrantOption {
  value: string
  label: string
  hint?: string
}

type FilterMode = "all" | "selected" | "unselected"

const SEARCH_THRESHOLD = 6

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((item) => set.has(item))
}

export function GrantPicker({
  options,
  value,
  isLoading,
  isSaving,
  emptyLabel,
  idPrefix,
  onSave,
}: {
  options: GrantOption[]
  value: string[]
  isLoading: boolean
  isSaving: boolean
  emptyLabel: string
  idPrefix: string
  onSave: (next: string[]) => void
}) {
  const [draft, setDraft] = useState<string[]>(value)
  const [search, setSearch] = useState("")
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const debouncedSearch = useDebouncedValue(search, 200)

  // Đồng bộ lại khi server trả giá trị mới (lần load đầu, sau khi lưu, sau refetch).
  useEffect(() => {
    setDraft(value)
  }, [value])

  const selected = useMemo(() => new Set(draft), [draft])
  const isDirty = !sameSet(draft, value)

  const { addedCount, removedCount } = useMemo(() => {
    const original = new Set(value)
    const added = draft.filter((item) => !original.has(item)).length
    const removed = value.filter((item) => !selected.has(item)).length
    return { addedCount: added, removedCount: removed }
  }, [draft, value, selected])

  const changedCount = addedCount + removedCount

  // Lọc theo search + filterMode (tất cả / đã chọn / chưa chọn)
  const visibleOptions = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase()
    return options.filter((option) => {
      // Bộ lọc trạng thái
      if (filterMode === "selected" && !selected.has(option.value)) return false
      if (filterMode === "unselected" && selected.has(option.value)) return false

      // Tìm kiếm từ khoá
      if (!keyword) return true
      return (
        option.label.toLowerCase().includes(keyword) ||
        option.value.toLowerCase().includes(keyword) ||
        (option.hint && option.hint.toLowerCase().includes(keyword))
      )
    })
  }, [options, debouncedSearch, filterMode, selected])

  const toggle = (optionValue: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(optionValue)
    else next.delete(optionValue)
    // Giữ thứ tự theo `options` để payload ổn định.
    setDraft(options.map((o) => o.value).filter((v) => next.has(v)))
  }

  // Chọn toàn bộ visible options
  const selectAllVisible = () => {
    const next = new Set(selected)
    for (const opt of visibleOptions) {
      next.add(opt.value)
    }
    setDraft(options.map((o) => o.value).filter((v) => next.has(v)))
  }

  // Bỏ chọn toàn bộ visible options
  const deselectAllVisible = () => {
    const next = new Set(selected)
    for (const opt of visibleOptions) {
      next.delete(opt.value)
    }
    setDraft(options.map((o) => o.value).filter((v) => next.has(v)))
  }

  // Chọn tất cả (toàn bộ options không quan tâm lọc)
  const selectAll = () => {
    setDraft(options.map((o) => o.value))
  }

  // Bỏ chọn tất cả (toàn bộ options)
  const deselectAll = () => {
    setDraft([])
  }

  // Đảo ngược lựa chọn
  const invertSelection = () => {
    const next = new Set<string>()
    for (const opt of options) {
      if (!selected.has(opt.value)) {
        next.add(opt.value)
      }
    }
    setDraft(options.map((o) => o.value).filter((v) => next.has(v)))
  }

  // Trạng thái Master Checkbox cho visibleOptions
  const visibleSelectedCount = useMemo(() => {
    return visibleOptions.filter((opt) => selected.has(opt.value)).length
  }, [visibleOptions, selected])

  const allVisibleSelected =
    visibleOptions.length > 0 && visibleSelectedCount === visibleOptions.length
  const someVisibleSelected =
    visibleSelectedCount > 0 && visibleSelectedCount < visibleOptions.length

  const handleMasterToggle = (checked: boolean) => {
    if (checked) {
      selectAllVisible()
    } else {
      deselectAllVisible()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_item, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    )
  }

  const hasSearch = search.trim().length > 0

  return (
    <div className="flex flex-col gap-3.5">
      {/* Search Bar & Quick Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {options.length > SEARCH_THRESHOLD ? (
          <div className="relative flex-1 max-w-md">
            <IconSearch
              stroke={1.5}
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="pl-9 pr-8"
              placeholder="Tìm theo tên hoặc mã..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {hasSearch ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                title="Xoá tìm kiếm"
              >
                <IconX className="size-3.5" />
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Filter Pills (All / Selected / Unselected) */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border bg-muted/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition whitespace-nowrap",
              filterMode === "all"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tất cả ({options.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("selected")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition whitespace-nowrap",
              filterMode === "selected"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Đã chọn ({selected.size})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("unselected")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition whitespace-nowrap",
              filterMode === "unselected"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Chưa chọn ({options.length - selected.size})
          </button>
        </div>
      </div>

      {/* Action Header: Master Checkbox + Quick Batch Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border bg-card/60 px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <Checkbox
            id={`${idPrefix}-master`}
            checked={allVisibleSelected}
            indeterminate={someVisibleSelected}
            onCheckedChange={handleMasterToggle}
            disabled={isSaving || visibleOptions.length === 0}
          />
          <label
            htmlFor={`${idPrefix}-master`}
            className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground select-none"
          >
            {allVisibleSelected
              ? `Bỏ chọn tất cả (${visibleSelectedCount})`
              : `Chọn tất cả hiển thị (${visibleSelectedCount}/${visibleOptions.length})`}
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={selectAll}
            disabled={isSaving || selected.size === options.length}
          >
            <IconChecklist className="size-3.5" data-icon="inline-start" />
            Chọn tất cả ({options.length})
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={deselectAll}
            disabled={isSaving || selected.size === 0}
          >
            <IconX className="size-3.5" data-icon="inline-start" />
            Bỏ chọn tất cả
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={invertSelection}
            disabled={isSaving || options.length === 0}
          >
            <IconRotate2 className="size-3.5" data-icon="inline-start" />
            Đảo ngược
          </Button>
        </div>
      </div>

      {/* Grid of Option Cards */}
      <div className="grid max-h-96 gap-2.5 overflow-y-auto rounded-2xl border bg-muted/10 p-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {visibleOptions.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <p>
              {hasSearch
                ? `Không có mục nào khớp với từ khoá "${search}".`
                : filterMode === "selected"
                  ? "Chưa có mục nào được chọn."
                  : filterMode === "unselected"
                    ? "Tất cả các mục đều đã được chọn."
                    : "Không có dữ liệu hiển thị."}
            </p>
            {hasSearch ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSearch("")}
              >
                Xóa tìm kiếm
              </Button>
            ) : null}
          </div>
        ) : (
          visibleOptions.map((option) => {
            const id = `${idPrefix}-${option.value}`
            const isChecked = selected.has(option.value)

            return (
              <label
                key={option.value}
                htmlFor={id}
                data-selected={isChecked}
                className={cn(
                  "group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all select-none",
                  "bg-card hover:border-primary/40 hover:bg-accent/30",
                  isChecked &&
                    "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20 shadow-xs dark:bg-primary/[0.07]"
                )}
              >
                <Checkbox
                  id={id}
                  className="mt-0.5 shrink-0"
                  checked={isChecked}
                  onCheckedChange={(checked) => toggle(option.value, checked)}
                  disabled={isSaving}
                />
                <div className="grid min-w-0 flex-1 gap-1">
                  <span className="text-sm font-medium leading-snug break-words text-foreground transition-colors group-hover:text-primary">
                    {option.label}
                  </span>
                  {option.hint ? (
                    <span className="font-mono text-[11px] text-muted-foreground/80 break-all">
                      {option.hint}
                    </span>
                  ) : null}
                </div>
              </label>
            )
          })
        )}
      </div>

      {/* Smart Sticky Save Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/80 p-3.5 backdrop-blur-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-foreground">
            Đang cấp:{" "}
            <span className="font-semibold text-primary">{draft.length}</span> /{" "}
            {options.length} mục
          </span>
          <span className="text-muted-foreground">
            ({Math.round((draft.length / (options.length || 1)) * 100)}%)
          </span>

          {isDirty ? (
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 font-normal"
            >
              Chưa lưu ({changedCount}): {addedCount > 0 ? `+${addedCount} thêm` : ""}
              {addedCount > 0 && removedCount > 0 ? ", " : ""}
              {removedCount > 0 ? `-${removedCount} bớt` : ""}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!isDirty || isSaving}
            onClick={() => setDraft(value)}
          >
            <IconRotate2 stroke={1.5} data-icon="inline-start" />
            Hoàn tác
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!isDirty || isSaving}
            onClick={() => onSave(draft)}
          >
            {isSaving ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <IconDeviceFloppy stroke={1.5} data-icon="inline-start" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  )
}
