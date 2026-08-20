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
import {
  ENG_LEVELS,
  OPTION_COUNTS,
  formatModelName,
  formatOptionCountLabel,
  getQuizTypeLabel,
  QUIZ_TYPES,
} from "@/features/quiz/constants.ts"
import type { EngLevel, OptionCount, QuizType } from "@/features/quiz/types.ts"
import {
  formatTopicLabel,
  useTopicOptions,
} from "@/features/topics/hooks/use-topics.ts"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"
import { cn } from "@/lib/utils"

import {
  ALL_LEVELS_LABEL,
  ALL_LEVELS_VALUE,
  ALL_MODELS_LABEL,
  ALL_MODELS_VALUE,
  ALL_OPTION_COUNTS_LABEL,
  ALL_OPTION_COUNTS_VALUE,
  ALL_QUIZ_TYPES_LABEL,
  ALL_QUIZ_TYPES_VALUE,
  ALL_TOPICS_LABEL,
  ALL_TOPICS_VALUE,
  FILTER_PILL,
  FILTER_PILL_ACTIVE,
  FILTER_PILL_LABEL,
  NO_TOPIC_FILTER_LABEL,
  NO_TOPIC_VALUE,
} from "../constants.ts"
import { usePoolModels } from "../hooks/use-pool-models.ts"
import { PoolDateRangeFilter } from "./pool-date-range-filter.tsx"

export interface PoolToolbarFilters {
  q: string | undefined
  engLevel: EngLevel | undefined
  quizType: QuizType | undefined
  topicId: number | undefined
  noTopic: boolean
  model: string | undefined
  optionCount: OptionCount | undefined
  createdFrom: string | undefined
  createdTo: string | undefined
}

export function PoolQuestionsToolbar({
  filters,
  hasActiveFilter,
  isRefreshing,
  onSearchChange,
  onFilterChange,
  onClearAll,
  onRefresh,
  children,
}: {
  filters: PoolToolbarFilters
  hasActiveFilter: boolean
  isRefreshing: boolean
  onSearchChange: (value: string | undefined) => void
  onFilterChange: (patch: Partial<PoolToolbarFilters>) => void
  onClearAll: () => void
  onRefresh: () => void
  /** Slot cuối hàng 1 — dùng cho menu ẩn/hiện cột (cần table instance). */
  children?: React.ReactNode
}) {
  const {
    topics,
    items: topicItems,
    isPending: isTopicsPending,
  } = useTopicOptions()
  const { models, isPending: isModelsPending } = usePoolModels()

  // Gõ mượt cục bộ, chỉ ghi vào URL/search param sau khi ngừng gõ 350ms.
  const [draft, setDraft] = useState(filters.q ?? "")
  const debouncedDraft = useDebouncedValue(draft, 350)

  // Chỉ chạy lại khi debouncedDraft đổi — cố tình không đưa q/onSearchChange vào deps,
  // vì onSearchChange kéo theo q đổi và sẽ tạo vòng lặp effect không cần thiết.
  useEffect(() => {
    const trimmed = debouncedDraft.trim()
    if (trimmed !== (filters.q ?? "")) onSearchChange(trimmed || undefined)
  }, [debouncedDraft])

  // Resync khi q đổi từ bên ngoài (nút "Xoá lọc", back/forward trình duyệt).
  // Bỏ qua nếu draft hiện tại (sau trim) đã khớp q — tránh xoá khoảng trắng
  // người dùng vừa gõ ngay khi round-trip debounce ở trên vừa cập nhật q.
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
      QUIZ_TYPES.map((type) => [type, getQuizTypeLabel(type)])
    ),
  }
  const topicSelectItems = {
    [ALL_TOPICS_VALUE]: ALL_TOPICS_LABEL,
    [NO_TOPIC_VALUE]: NO_TOPIC_FILTER_LABEL,
    ...topicItems,
  }
  const modelItems = {
    [ALL_MODELS_VALUE]: ALL_MODELS_LABEL,
    ...Object.fromEntries(
      models.map((item) => [item.model, formatModelName(item.model).name])
    ),
  }
  const optionCountItems = {
    [ALL_OPTION_COUNTS_VALUE]: ALL_OPTION_COUNTS_LABEL,
    ...Object.fromEntries(
      OPTION_COUNTS.map((count) => [
        String(count),
        formatOptionCountLabel(count),
      ])
    ),
  }

  const topicValue = filters.noTopic
    ? NO_TOPIC_VALUE
    : filters.topicId === undefined
      ? ALL_TOPICS_VALUE
      : String(filters.topicId)
  const isTopicActive = filters.noTopic || filters.topicId !== undefined

  return (
    <div className="sticky top-16 z-10 flex flex-col gap-3 rounded-2xl border bg-background px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:max-w-md">
          {/* Spinner thay chỗ icon kính lúp (cùng khung 16px) chứ không thay chỗ
              nút X — giữ nút xoá luôn bấm được và không giật layout khi đang tải. */}
          <InputGroupAddon align="inline-start">
            {isSearchPending || isRefreshing ? (
              <Spinner className="size-4 text-muted-foreground" />
            ) : (
              <IconSearch stroke={1.5} />
            )}
          </InputGroupAddon>
          <InputGroupInput
            id="questions-search"
            aria-label="Tìm câu hỏi"
            placeholder="Tìm nội dung, model hoặc ID..."
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
          value={filters.engLevel ?? ALL_LEVELS_VALUE}
          onValueChange={(value) =>
            onFilterChange({
              engLevel:
                value === ALL_LEVELS_VALUE ? undefined : (value as EngLevel),
            })
          }
        >
          <SelectTrigger
            aria-label="Lọc theo cấp độ"
            className={cn(FILTER_PILL, filters.engLevel && FILTER_PILL_ACTIVE)}
          >
            <span className={FILTER_PILL_LABEL}>Cấp độ:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_LEVELS_VALUE}>{ALL_LEVELS_LABEL}</SelectItem>
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
                value === ALL_QUIZ_TYPES_VALUE
                  ? undefined
                  : (value as QuizType),
            })
          }
        >
          <SelectTrigger
            aria-label="Lọc theo loại câu"
            className={cn(FILTER_PILL, filters.quizType && FILTER_PILL_ACTIVE)}
          >
            <span className={FILTER_PILL_LABEL}>Loại câu:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_QUIZ_TYPES_VALUE}>
              {ALL_QUIZ_TYPES_LABEL}
            </SelectItem>
            {QUIZ_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {getQuizTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Lúc chưa tải xong topic vẫn render đúng pill (disabled) thay vì Skeleton
            khác kích thước — tránh nhảy layout khi danh sách về. */}
        <Select
          items={topicSelectItems}
          value={topicValue}
          disabled={isTopicsPending}
          onValueChange={(value) => {
            if (value === ALL_TOPICS_VALUE)
              onFilterChange({ topicId: undefined, noTopic: false })
            else if (value === NO_TOPIC_VALUE)
              onFilterChange({ topicId: undefined, noTopic: true })
            else onFilterChange({ topicId: Number(value), noTopic: false })
          }}
        >
          <SelectTrigger
            aria-label="Lọc theo chủ đề"
            className={cn(FILTER_PILL, isTopicActive && FILTER_PILL_ACTIVE)}
          >
            <span className={FILTER_PILL_LABEL}>Chủ đề:</span>
            {isTopicsPending ? <span>Đang tải...</span> : <SelectValue />}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TOPICS_VALUE}>{ALL_TOPICS_LABEL}</SelectItem>
            <SelectItem value={NO_TOPIC_VALUE}>
              {NO_TOPIC_FILTER_LABEL}
            </SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={String(topic.id)}>
                {formatTopicLabel(topic)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={modelItems}
          value={filters.model ?? ALL_MODELS_VALUE}
          disabled={isModelsPending}
          onValueChange={(value) =>
            onFilterChange({
              model: !value || value === ALL_MODELS_VALUE ? undefined : value,
            })
          }
        >
          <SelectTrigger
            aria-label="Lọc theo model"
            title={filters.model}
            className={cn(FILTER_PILL, filters.model && FILTER_PILL_ACTIVE)}
          >
            <span className={FILTER_PILL_LABEL}>Model:</span>
            {isModelsPending ? <span>Đang tải...</span> : <SelectValue />}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_MODELS_VALUE}>{ALL_MODELS_LABEL}</SelectItem>
            {models.map((item) => (
              <SelectItem key={item.model} value={item.model}>
                <span className="truncate">
                  {formatModelName(item.model).name}
                </span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {item.count}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={optionCountItems}
          value={
            filters.optionCount === undefined
              ? ALL_OPTION_COUNTS_VALUE
              : String(filters.optionCount)
          }
          onValueChange={(value) =>
            onFilterChange({
              optionCount:
                value === ALL_OPTION_COUNTS_VALUE
                  ? undefined
                  : (Number(value) as OptionCount),
            })
          }
        >
          <SelectTrigger
            aria-label="Lọc theo số đáp án"
            className={cn(
              FILTER_PILL,
              filters.optionCount && FILTER_PILL_ACTIVE
            )}
          >
            <span className={FILTER_PILL_LABEL}>Đáp án:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_OPTION_COUNTS_VALUE}>
              {ALL_OPTION_COUNTS_LABEL}
            </SelectItem>
            {OPTION_COUNTS.map((count) => (
              <SelectItem key={count} value={String(count)}>
                {formatOptionCountLabel(count)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <PoolDateRangeFilter
          value={{
            createdFrom: filters.createdFrom,
            createdTo: filters.createdTo,
          }}
          onChange={(range) => onFilterChange(range)}
        />

        <Button
          variant="ghost"
          className="ml-auto"
          onClick={onClearAll}
          disabled={!hasActiveFilter}
        >
          <IconFilterOff stroke={1.5} data-icon="inline-start" />
          Xoá lọc
        </Button>
      </div>
    </div>
  )
}
