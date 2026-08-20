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
import { formatTopicLabel, useTopics } from "@/features/topics/hooks/use-topics.ts"

import {
  ACTIVE_VALUE,
  ALL_LABEL,
  ALL_VALUE,
  INACTIVE_VALUE,
} from "../constants.ts"
import { useReadingStoreModels } from "../hooks/use-reading-models.ts"

export interface ReadingsToolbarFilters {
  q: string | undefined
  cefrLevel: EngLevel | undefined
  topicId: number | undefined
  model: string | undefined
  isActive: boolean | undefined
}

const SELECT_TRIGGER = "h-9 w-auto min-w-36 rounded-3xl"

export function ReadingsToolbar({
  filters,
  hasActiveFilter,
  isRefreshing,
  onSearchChange,
  onFilterChange,
  onClearAll,
  onRefresh,
}: {
  filters: ReadingsToolbarFilters
  hasActiveFilter: boolean
  isRefreshing: boolean
  onSearchChange: (value: string | undefined) => void
  onFilterChange: (patch: Partial<ReadingsToolbarFilters>) => void
  onClearAll: () => void
  onRefresh: () => void
}) {
  const { topics } = useTopics()
  const { models } = useReadingStoreModels()

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
          placeholder="Tìm tiêu đề, nội dung, model…"
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
        value={
          filters.topicId === undefined ? ALL_VALUE : String(filters.topicId)
        }
        onValueChange={(value) =>
          onFilterChange({
            topicId: value === ALL_VALUE ? undefined : Number(value),
          })
        }
      >
        <SelectTrigger className={SELECT_TRIGGER} aria-label="Lọc theo chủ đề">
          <SelectValue placeholder="Chủ đề" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Chủ đề: {ALL_LABEL}</SelectItem>
          {topics.map((topic) => (
            <SelectItem key={topic.id} value={String(topic.id)}>
              {formatTopicLabel(topic)}
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
          {models.map((stat) => (
            <SelectItem key={stat.model} value={stat.model}>
              {stat.model} ({stat.count})
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

      {hasActiveFilter ? (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          <IconX stroke={1.5} data-icon="inline-start" />
          Xoá lọc
        </Button>
      ) : null}

      <Button
        variant="outline"
        size="icon"
        className="ml-auto size-9"
        aria-label="Tải lại"
        disabled={isRefreshing}
        onClick={onRefresh}
      >
        <IconRefresh stroke={1.5} />
      </Button>
    </div>
  )
}
