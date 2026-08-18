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
import { ENG_LEVELS } from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"

import {
  ACTIVE_VALUE,
  ALL_LABEL,
  ALL_VALUE,
  INACTIVE_VALUE,
  READING_QUESTION_TYPES,
  READING_QUESTION_TYPE_LABELS,
} from "../constants.ts"
import { useReadingQuestionStoreModels } from "../hooks/use-reading-question-models.ts"

export interface ReadingQuestionsToolbarFilters {
  q: string | undefined
  cefrLevel: EngLevel | undefined
  quizType: string | undefined
  model: string | undefined
  isActive: boolean | undefined
  passageId: number | undefined
}

const SELECT_TRIGGER = "h-9 w-auto min-w-36 rounded-3xl"

export function ReadingQuestionsToolbar({
  filters,
  hasActiveFilter,
  isRefreshing,
  onSearchChange,
  onFilterChange,
  onClearAll,
  onRefresh,
}: {
  filters: ReadingQuestionsToolbarFilters
  hasActiveFilter: boolean
  isRefreshing: boolean
  onSearchChange: (value: string | undefined) => void
  onFilterChange: (patch: Partial<ReadingQuestionsToolbarFilters>) => void
  onClearAll: () => void
  onRefresh: () => void
}) {
  const { models } = useReadingQuestionStoreModels()

  // Input là uncontrolled-ish: gõ tới đâu hiện tới đó, chỉ đẩy lên URL khi submit
  // để mỗi ký tự không thành một entry history + một request.
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
          placeholder="Tìm câu hỏi, đáp án, giải thích…"
          className="h-9 rounded-3xl pl-9"
          onChange={(event) => setDraftQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitSearch()
          }}
          onBlur={submitSearch}
        />
      </div>

      <Select
        value={filters.cefrLevel ?? ALL_VALUE}
        onValueChange={(value) =>
          onFilterChange({
            cefrLevel: value === ALL_VALUE ? undefined : (value as EngLevel),
          })
        }
      >
        <SelectTrigger className={SELECT_TRIGGER} aria-label="Lọc theo cấp độ">
          <SelectValue placeholder="Cấp độ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Cấp độ: {ALL_LABEL}</SelectItem>
          {ENG_LEVELS.map((level) => (
            <SelectItem key={level} value={level}>
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.quizType ?? ALL_VALUE}
        onValueChange={(value) =>
          onFilterChange({
            quizType: !value || value === ALL_VALUE ? undefined : value,
          })
        }
      >
        <SelectTrigger
          className={SELECT_TRIGGER}
          aria-label="Lọc theo loại câu hỏi"
        >
          <SelectValue placeholder="Loại" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Loại: {ALL_LABEL}</SelectItem>
          {READING_QUESTION_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {READING_QUESTION_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.model ?? ALL_VALUE}
        onValueChange={(value) =>
          onFilterChange({
            model: !value || value === ALL_VALUE ? undefined : value,
          })
        }
      >
        <SelectTrigger className={SELECT_TRIGGER} aria-label="Lọc theo model">
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Model: {ALL_LABEL}</SelectItem>
          {models?.map((item) => (
            <SelectItem key={item.model} value={item.model}>
              {item.model} ({item.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={
          filters.isActive === undefined
            ? ALL_VALUE
            : filters.isActive
              ? ACTIVE_VALUE
              : INACTIVE_VALUE
        }
        onValueChange={(value) =>
          onFilterChange({
            isActive: value === ALL_VALUE ? undefined : value === ACTIVE_VALUE,
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
          <SelectItem value={ALL_VALUE}>Trạng thái: {ALL_LABEL}</SelectItem>
          <SelectItem value={ACTIVE_VALUE}>Đang bật</SelectItem>
          <SelectItem value={INACTIVE_VALUE}>Đã tắt</SelectItem>
        </SelectContent>
      </Select>

      {filters.passageId === undefined ? null : (
        <Button
          variant="secondary"
          size="sm"
          className="h-9 rounded-3xl"
          onClick={() => onFilterChange({ passageId: undefined })}
        >
          Bài đọc #{filters.passageId}
          <IconX stroke={1.5} data-icon="inline-end" />
        </Button>
      )}

      {hasActiveFilter ? (
        <Button variant="ghost" size="sm" className="h-9" onClick={onClearAll}>
          <IconX stroke={1.5} data-icon="inline-start" />
          Xoá lọc
        </Button>
      ) : null}

      <Button
        variant="ghost"
        size="sm"
        className="ml-auto h-9"
        disabled={isRefreshing}
        onClick={onRefresh}
      >
        <IconRefresh stroke={1.5} data-icon="inline-start" />
        Tải lại
      </Button>
    </div>
  )
}
