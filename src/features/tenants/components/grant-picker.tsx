import { useEffect, useMemo, useState } from "react"
import { IconDeviceFloppy, IconSearch } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"

export interface GrantOption {
  value: string
  label: string
  hint?: string
}

const SEARCH_THRESHOLD = 8

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
  const debouncedSearch = useDebouncedValue(search, 250)

  // Đồng bộ lại khi server trả giá trị mới (lần load đầu, sau khi lưu, sau refetch).
  useEffect(() => {
    setDraft(value)
  }, [value])

  const selected = useMemo(() => new Set(draft), [draft])
  const isDirty = !sameSet(draft, value)

  const changedCount = useMemo(() => {
    const original = new Set(value)
    const added = draft.filter((item) => !original.has(item)).length
    const removed = value.filter((item) => !selected.has(item)).length
    return added + removed
  }, [draft, value, selected])

  const visibleOptions = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase()
    if (!keyword) return options
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(keyword) ||
        option.value.toLowerCase().includes(keyword)
    )
  }, [options, debouncedSearch])

  const toggle = (optionValue: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(optionValue)
    else next.delete(optionValue)
    // Giữ thứ tự theo `options` để payload ổn định.
    setDraft(options.map((o) => o.value).filter((v) => next.has(v)))
  }

  if (isLoading) {
    return (
      <div className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_item, index) => (
          <Skeleton key={index} className="h-5 w-full max-w-48" />
        ))}
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {options.length > SEARCH_THRESHOLD ? (
        <div className="relative">
          <IconSearch
            stroke={1.5}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-9"
            placeholder="Tìm theo tên"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      ) : null}

      <div className="grid max-h-80 gap-3 overflow-y-auto rounded-2xl border p-4 sm:grid-cols-2">
        {visibleOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Không có mục nào khớp từ khoá.
          </p>
        ) : (
          visibleOptions.map((option) => {
            const id = `${idPrefix}-${option.value}`
            return (
              <div key={option.value} className="flex items-start gap-2.5">
                <Checkbox
                  id={id}
                  className="mt-0.5"
                  checked={selected.has(option.value)}
                  onCheckedChange={(checked) => toggle(option.value, checked)}
                  disabled={isSaving}
                />
                <div className="grid gap-0.5">
                  <Label htmlFor={id} className="font-normal">
                    {option.label}
                  </Label>
                  {option.hint ? (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {option.hint}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {isDirty
            ? `Đã đổi ${changedCount} mục, chưa lưu. Lưu sẽ thay thế toàn bộ danh sách hiện tại.`
            : `Đang cấp ${value.length}/${options.length} mục.`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!isDirty || isSaving}
            onClick={() => setDraft(value)}
          >
            Hoàn tác
          </Button>
          <Button
            size="sm"
            disabled={!isDirty || isSaving}
            onClick={() => onSave(draft)}
          >
            {isSaving ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <IconDeviceFloppy stroke={1.5} data-icon="inline-start" />
            )}
            Lưu
          </Button>
        </div>
      </div>
    </div>
  )
}
