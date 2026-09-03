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
import { ENG_LEVELS, formatModelName } from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"
import {
  formatTopicLabel,
  useTopicOptions,
} from "@/features/topics/hooks/use-topics.ts"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"
import { cn } from "@/lib/utils"

import {
  ACTIVE_VALUE,
  ALL_LEVELS_LABEL,
  ALL_LEVELS_VALUE,
  ALL_MODELS_LABEL,
  ALL_MODELS_VALUE,
  ALL_STATUS_LABEL,
  ALL_STATUS_VALUE,
  ALL_TOPICS_LABEL,
  ALL_TOPICS_VALUE,
  ALL_TYPES_LABEL,
  ALL_TYPES_VALUE,
  FILTER_PILL,
  FILTER_PILL_ACTIVE,
  FILTER_PILL_LABEL,
  INACTIVE_VALUE,
  READING_TYPES,
  READING_TYPE_META,
} from "../constants.ts"
import { useReadingStoreModels } from "../hooks/use-reading-models.ts"
import type { ReadingType } from "../types.ts"

export interface ReadingsToolbarFilters {
  q: string | undefined
  cefrLevel: EngLevel | undefined
  topicId: number | undefined
  type: ReadingType | undefined
  model: string | undefined
  isActive: boolean | undefined
}

export function ReadingsToolbar({
  filters,
  hasActiveFilter,
  isRefreshing,
  onSearchChange,
  onFilterChange,
  onClearAll,
  onRefresh,
  children,
}: {
  filters: ReadingsToolbarFilters
  hasActiveFilter: boolean
  isRefreshing: boolean
  onSearchChange: (value: string | undefined) => void
  onFilterChange: (patch: Partial<ReadingsToolbarFilters>) => void
  onClearAll: () => void
  onRefresh: () => void
  children?: React.ReactNode
}) {
  const { topics, items: topicItems } = useTopicOptions()
  const { models } = useReadingStoreModels()

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

  const topicSelectItems = {
    [ALL_TOPICS_VALUE]: ALL_TOPICS_LABEL,
    ...topicItems,
  }

  const typeItems = {
    [ALL_TYPES_VALUE]: ALL_TYPES_LABEL,
    ...Object.fromEntries(
      READING_TYPES.map((type) => [type, READING_TYPE_META[type].label])
    ),
  }

  const modelItems = {
    [ALL_MODELS_VALUE]: ALL_MODELS_LABEL,
    ...Object.fromEntries(
      models.map((item) => [item.model, formatModelName(item.model).name])
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
            id="readings-search"
            aria-label="Tìm bài đọc"
            placeholder="Tìm tiêu đề, nội dung, model hoặc ID..."
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
          items={topicSelectItems}
          value={
            filters.topicId === undefined
              ? ALL_TOPICS_VALUE
              : String(filters.topicId)
          }
          onValueChange={(value) =>
            onFilterChange({
              topicId: value === ALL_TOPICS_VALUE ? undefined : Number(value),
            })
          }
        >
          <SelectTrigger
            aria-label="Lọc theo chủ đề"
            className={cn(
              FILTER_PILL,
              filters.topicId !== undefined && FILTER_PILL_ACTIVE
            )}
          >
            <span className={FILTER_PILL_LABEL}>Chủ đề:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TOPICS_VALUE}>Tất cả chủ đề</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={String(topic.id)}>
                {formatTopicLabel(topic)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={typeItems}
          value={filters.type ?? ALL_TYPES_VALUE}
          onValueChange={(value) =>
            onFilterChange({
              type:
                value === ALL_TYPES_VALUE ? undefined : (value as ReadingType),
            })
          }
        >
          <SelectTrigger
            aria-label="Lọc theo loại bài"
            className={cn(FILTER_PILL, filters.type && FILTER_PILL_ACTIVE)}
          >
            <span className={FILTER_PILL_LABEL}>Loại bài:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPES_VALUE}>Tất cả loại bài</SelectItem>
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
            {models.map((stat) => (
              <SelectItem key={stat.model} value={stat.model}>
                {formatModelName(stat.model).name} ({stat.count})
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
