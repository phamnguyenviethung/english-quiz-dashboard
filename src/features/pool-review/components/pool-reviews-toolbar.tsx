import { useEffect, useState } from "react"
import {
  IconFilter,
  IconFilterOff,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ENG_LEVELS,
  QUIZ_TYPES,
  getQuizTypeLabel,
} from "@/features/quiz/constants.ts"
import type { EngLevel, QuizType } from "@/features/quiz/types.ts"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"
import { cn } from "@/lib/utils"

import { REVIEW_STATUS_META, REVIEW_VERDICT_META } from "../constants.ts"
import type { PoolReviewsParams } from "../types.ts"

const ALL_VALUE = "all"

type ReviewStatus = NonNullable<PoolReviewsParams["status"]>
type ReviewVerdict = NonNullable<PoolReviewsParams["verdict"]>

export interface PoolReviewsToolbarFilters {
  q: string | undefined
  status: ReviewStatus | undefined
  verdict: ReviewVerdict | undefined
  quizType: QuizType | undefined
  engLevel: EngLevel | undefined
}

function FilterSelects({
  filters,
  onFilterChange,
  stacked,
}: {
  filters: PoolReviewsToolbarFilters
  onFilterChange: (patch: Partial<PoolReviewsToolbarFilters>) => void
  stacked?: boolean
}) {
  const triggerClass = cn(
    "h-9 rounded-3xl",
    stacked ? "w-full" : "w-auto min-w-36"
  )

  return (
    <>
      <Select
        value={filters.status ?? ALL_VALUE}
        onValueChange={(value) =>
          onFilterChange({
            status: value === ALL_VALUE ? undefined : (value as ReviewStatus),
          })
        }
      >
        <SelectTrigger
          className={triggerClass}
          aria-label="Lọc theo trạng thái"
        >
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Trạng thái: Tất cả</SelectItem>
          {Object.entries(REVIEW_STATUS_META).map(([value, meta]) => (
            <SelectItem key={value} value={value}>
              {meta.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.verdict ?? ALL_VALUE}
        onValueChange={(value) =>
          onFilterChange({
            verdict: value === ALL_VALUE ? undefined : (value as ReviewVerdict),
          })
        }
      >
        <SelectTrigger className={triggerClass} aria-label="Lọc theo kết luận">
          <SelectValue placeholder="Kết luận" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Kết luận: Tất cả</SelectItem>
          {Object.entries(REVIEW_VERDICT_META).map(([value, meta]) => (
            <SelectItem key={value} value={value}>
              {meta.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.quizType ?? ALL_VALUE}
        onValueChange={(value) =>
          onFilterChange({
            quizType: value === ALL_VALUE ? undefined : (value as QuizType),
          })
        }
      >
        <SelectTrigger className={triggerClass} aria-label="Lọc theo loại câu">
          <SelectValue placeholder="Loại câu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Loại câu: Tất cả</SelectItem>
          {QUIZ_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {getQuizTypeLabel(type)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.engLevel ?? ALL_VALUE}
        onValueChange={(value) =>
          onFilterChange({
            engLevel: value === ALL_VALUE ? undefined : (value as EngLevel),
          })
        }
      >
        <SelectTrigger className={triggerClass} aria-label="Lọc theo cấp độ">
          <SelectValue placeholder="Cấp độ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Cấp độ: Tất cả</SelectItem>
          {ENG_LEVELS.map((level) => (
            <SelectItem key={level} value={level}>
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

export function PoolReviewsToolbar({
  filters,
  hasActiveFilter,
  isRefreshing,
  onSearchChange,
  onFilterChange,
  onClearAll,
  onRefresh,
}: {
  filters: PoolReviewsToolbarFilters
  hasActiveFilter: boolean
  isRefreshing: boolean
  onSearchChange: (value: string | undefined) => void
  onFilterChange: (patch: Partial<PoolReviewsToolbarFilters>) => void
  onClearAll: () => void
  onRefresh: () => void
}) {
  const [draft, setDraft] = useState(filters.q ?? "")
  const debounced = useDebouncedValue(draft, 350)

  // Chỉ ghi vào URL khi ngừng gõ; không đưa onSearchChange vào deps để tránh vòng lặp.
  useEffect(() => {
    const trimmed = debounced.trim()
    if (trimmed !== (filters.q ?? "")) onSearchChange(trimmed || undefined)
  }, [debounced])

  // Resync khi q đổi từ ngoài (Xoá lọc, back/forward).
  useEffect(() => {
    if (draft.trim() === (filters.q ?? "")) return
    setDraft(filters.q ?? "")
  }, [filters.q])

  const activeSelectCount = [
    filters.status,
    filters.verdict,
    filters.quizType,
    filters.engLevel,
  ].filter(Boolean).length

  return (
    <div className="sticky top-16 z-10 flex flex-wrap items-center gap-2 rounded-2xl border bg-background px-3 py-2.5">
      <div className="relative min-w-48 flex-1 sm:max-w-72">
        <IconSearch
          stroke={1.5}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={draft}
          placeholder="Tìm theo tóm tắt, nội dung, id…"
          className="h-9 rounded-3xl pl-9"
          onChange={(event) => setDraft(event.target.value)}
        />
      </div>

      {/* Desktop: các select inline */}
      <div className="hidden flex-wrap items-center gap-2 md:flex">
        <FilterSelects filters={filters} onFilterChange={onFilterChange} />
      </div>

      {/* Mobile: gom vào drawer */}
      <Drawer>
        <DrawerTrigger
          render={
            <Button variant="outline" size="sm" className="md:hidden">
              <IconFilter stroke={1.5} data-icon="inline-start" />
              Bộ lọc
              {activeSelectCount > 0 ? (
                <Badge variant="secondary" className="ml-1.5">
                  {activeSelectCount}
                </Badge>
              ) : null}
            </Button>
          }
        />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Bộ lọc review</DrawerTitle>
            <DrawerDescription>
              Lọc theo trạng thái, kết luận, loại câu và cấp độ.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-3 px-4">
            <FilterSelects
              filters={filters}
              onFilterChange={onFilterChange}
              stacked
            />
          </div>
          <DrawerFooter>
            <Button
              variant="outline"
              onClick={onClearAll}
              disabled={!hasActiveFilter}
            >
              Xoá tất cả bộ lọc
            </Button>
            <DrawerClose render={<Button />}>Xong</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {hasActiveFilter ? (
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex"
          onClick={onClearAll}
        >
          <IconFilterOff stroke={1.5} data-icon="inline-start" />
          Xoá lọc
        </Button>
      ) : null}

      <Button
        variant="outline"
        size="sm"
        className="ml-auto"
        disabled={isRefreshing}
        onClick={onRefresh}
      >
        <IconRefresh stroke={1.5} data-icon="inline-start" />
        <span className="hidden sm:inline">Làm mới</span>
      </Button>
    </div>
  )
}
