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
import { BeginnerFilterPill } from "@/features/beginner/components/beginner-filter-pill.tsx"
import { Spinner } from "@/components/ui/spinner"
import { ENG_LEVELS, formatModelName } from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"
import {
  READING_TYPES,
  READING_TYPE_META,
} from "@/features/readings/constants.ts"
import type { ReadingType } from "@/features/readings/types.ts"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"
import { cn } from "@/lib/utils"

import {
  ACTIVE_VALUE,
  ALL_LEVELS_LABEL,
  ALL_LEVELS_VALUE,
  ALL_MODELS_LABEL,
  ALL_MODELS_VALUE,
  ALL_QUIZ_TYPES_LABEL,
  ALL_QUIZ_TYPES_VALUE,
  ALL_READING_TYPES_LABEL,
  ALL_READING_TYPES_VALUE,
  ALL_STATUS_LABEL,
  ALL_STATUS_VALUE,
  FILTER_PILL,
  FILTER_PILL_ACTIVE,
  FILTER_PILL_LABEL,
  INACTIVE_VALUE,
  READING_QUESTION_TYPES,
  READING_QUESTION_TYPE_LABELS,
} from "../constants.ts"
import { useReadingQuestionStoreModels } from "../hooks/use-reading-question-models.ts"

export interface ReadingQuestionsToolbarFilters {
  q: string | undefined
  cefrLevel: EngLevel | undefined
  type: ReadingType | undefined
  quizType: string | undefined
  model: string | undefined
  isActive: boolean | undefined
  forBeginner: boolean | undefined
  passageId: number | undefined
}

export function ReadingQuestionsToolbar({
  filters,
  hasActiveFilter,
  isRefreshing,
  onSearchChange,
  onFilterChange,
  onClearAll,
  onRefresh,
  children,
}: {
  filters: ReadingQuestionsToolbarFilters
  hasActiveFilter: boolean
  isRefreshing: boolean
  onSearchChange: (value: string | undefined) => void
  onFilterChange: (patch: Partial<ReadingQuestionsToolbarFilters>) => void
  onClearAll: () => void
  onRefresh: () => void
  children?: React.ReactNode
}) {
  const { models } = useReadingQuestionStoreModels()

  // Gõ mượt cục bộ, chỉ đẩy lên URL sau khi ngừng gõ 350ms
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

  const levelItems = {
    [ALL_LEVELS_VALUE]: ALL_LEVELS_LABEL,
    ...Object.fromEntries(ENG_LEVELS.map((level) => [level, level])),
  }

  const quizTypeItems = {
    [ALL_QUIZ_TYPES_VALUE]: ALL_QUIZ_TYPES_LABEL,
    ...Object.fromEntries(
      READING_QUESTION_TYPES.map((type) => [
        type,
        READING_QUESTION_TYPE_LABELS[type],
      ])
    ),
  }

  const readingTypeItems = {
    [ALL_READING_TYPES_VALUE]: ALL_READING_TYPES_LABEL,
    ...Object.fromEntries(
      READING_TYPES.map((type) => [type, READING_TYPE_META[type].label])
    ),
  }

  const modelItems = {
    [ALL_MODELS_VALUE]: ALL_MODELS_LABEL,
    ...Object.fromEntries(
      (models ?? []).map((item) => [
        item.model,
        formatModelName(item.model).name,
      ])
    ),
  }

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
            id="reading-questions-search"
            aria-label="Tìm câu hỏi đọc hiểu"
            placeholder="Tìm câu hỏi, đáp án, giải thích, model hoặc ID..."
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
          items={levelItems}
          value={filters.cefrLevel ?? ALL_LEVELS_VALUE}
          onValueChange={(value) =>
            onFilterChange({
              cefrLevel:
                value === ALL_LEVELS_VALUE ? undefined : (value as EngLevel),
            })
          }
        >
          <SelectTrigger
            aria-label="Lọc theo cấp độ"
            className={cn(FILTER_PILL, filters.cefrLevel && FILTER_PILL_ACTIVE)}
          >
            <span className={FILTER_PILL_LABEL}>Cấp độ:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_LEVELS_VALUE}>Tất cả cấp độ</SelectItem>
            {ENG_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={quizTypeItems}
          value={filters.quizType ?? ALL_QUIZ_TYPES_VALUE}
          onValueChange={(value) =>
            onFilterChange({
              quizType:
                !value || value === ALL_QUIZ_TYPES_VALUE ? undefined : value,
            })
          }
        >
          <SelectTrigger
            aria-label="Lọc theo loại câu hỏi"
            className={cn(FILTER_PILL, filters.quizType && FILTER_PILL_ACTIVE)}
          >
            <span className={FILTER_PILL_LABEL}>Loại câu:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_QUIZ_TYPES_VALUE}>
              Tất cả dạng câu
            </SelectItem>
            {READING_QUESTION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {READING_QUESTION_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={readingTypeItems}
          value={filters.type ?? ALL_READING_TYPES_VALUE}
          onValueChange={(value) =>
            onFilterChange({
              type:
                value === ALL_READING_TYPES_VALUE
                  ? undefined
                  : (value as ReadingType),
            })
          }
        >
          <SelectTrigger
            aria-label="Lọc theo loại bài đọc"
            className={cn(FILTER_PILL, filters.type && FILTER_PILL_ACTIVE)}
          >
            <span className={FILTER_PILL_LABEL}>Loại bài:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_READING_TYPES_VALUE}>
              Tất cả loại bài
            </SelectItem>
            {READING_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {READING_TYPE_META[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={modelItems}
          value={filters.model ?? ALL_MODELS_VALUE}
          onValueChange={(value) =>
            onFilterChange({
              model: !value || value === ALL_MODELS_VALUE ? undefined : value,
            })
          }
        >
          <SelectTrigger
            aria-label="Lọc theo model"
            className={cn(FILTER_PILL, filters.model && FILTER_PILL_ACTIVE)}
          >
            <span className={FILTER_PILL_LABEL}>Model:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_MODELS_VALUE}>Tất cả model</SelectItem>
            {models?.map((item) => (
              <SelectItem key={item.model} value={item.model}>
                {formatModelName(item.model).name} ({item.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={statusItems}
          value={statusValue}
          onValueChange={(value) =>
            onFilterChange({
              isActive:
                value === ALL_STATUS_VALUE ? undefined : value === ACTIVE_VALUE,
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

        <BeginnerFilterPill
          value={filters.forBeginner}
          onChange={(value) => onFilterChange({ forBeginner: value })}
        />

        {filters.passageId === undefined ? null : (
          <Button
            variant="secondary"
            size="sm"
            className="h-9 gap-1.5 rounded-3xl"
            onClick={() => onFilterChange({ passageId: undefined })}
          >
            Bài đọc #{filters.passageId}
            <IconX stroke={1.5} className="size-3.5" data-icon="inline-end" />
          </Button>
        )}

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
