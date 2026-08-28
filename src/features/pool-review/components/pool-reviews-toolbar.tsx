import { useEffect, useState } from "react"
import { IconRefresh, IconSearch, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
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

import { REVIEW_STATUS_META, REVIEW_VERDICT_META } from "../constants.ts"
import type { PoolReviewsParams } from "../types.ts"

const ALL_VALUE = "all"
const SELECT_TRIGGER = "h-9 w-auto min-w-36 rounded-3xl"

type ReviewStatus = NonNullable<PoolReviewsParams["status"]>
type ReviewVerdict = NonNullable<PoolReviewsParams["verdict"]>

export interface PoolReviewsToolbarFilters {
  q: string | undefined
  status: ReviewStatus | undefined
  verdict: ReviewVerdict | undefined
  quizType: QuizType | undefined
  engLevel: EngLevel | undefined
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
  const [draftQuery, setDraftQuery] = useState(filters.q ?? "")
  useEffect(() => setDraftQuery(filters.q ?? ""), [filters.q])

  const submitSearch = () => onSearchChange(draftQuery.trim() || undefined)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-56 flex-1 sm:max-w-72">
        <IconSearch
          stroke={1.5}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={draftQuery}
          placeholder="Tìm theo tóm tắt, nội dung, id…"
          className="h-9 rounded-3xl pl-9"
          onChange={(event) => setDraftQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitSearch()
          }}
          onBlur={submitSearch}
        />
      </div>

      <Select
        value={filters.status ?? ALL_VALUE}
        onValueChange={(value) =>
          onFilterChange({
            status: value === ALL_VALUE ? undefined : (value as ReviewStatus),
          })
        }
      >
        <SelectTrigger
          className={SELECT_TRIGGER}
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
        <SelectTrigger
          className={SELECT_TRIGGER}
          aria-label="Lọc theo kết luận"
        >
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
        <SelectTrigger
          className={SELECT_TRIGGER}
          aria-label="Lọc theo loại câu"
        >
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
        <SelectTrigger className={SELECT_TRIGGER} aria-label="Lọc theo cấp độ">
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

      {hasActiveFilter ? (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          <IconX stroke={1.5} data-icon="inline-start" />
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
        Làm mới
      </Button>
    </div>
  )
}
