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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ENG_LEVELS,
  QUIZ_TYPES,
  getQuizTypeLabel,
} from "@/features/quiz/constants.ts"
import type { EngLevel, QuizType } from "@/features/quiz/types.ts"
import { useTopicOptions } from "@/features/topics/hooks/use-topics.ts"
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts"

import {
  ALL_LEVELS_LABEL,
  ALL_LEVELS_VALUE,
  ALL_QUIZ_TYPES_LABEL,
  ALL_QUIZ_TYPES_VALUE,
  ALL_TOPICS_LABEL,
  ALL_TOPICS_VALUE,
  NO_TOPIC_LABEL,
  NO_TOPIC_VALUE,
} from "../constants.ts"

export function PoolQuestionsFilters({
  q,
  engLevel,
  quizType,
  topicId,
  noTopic,
  hasActiveFilter,
  isRefreshing,
  onSearchChange,
  onEngLevelChange,
  onQuizTypeChange,
  onTopicChange,
  onClear,
  onRefresh,
}: {
  q: string | undefined
  engLevel: EngLevel | undefined
  quizType: QuizType | undefined
  topicId: number | undefined
  noTopic: boolean
  hasActiveFilter: boolean
  isRefreshing: boolean
  onSearchChange: (value: string | undefined) => void
  onEngLevelChange: (value: EngLevel | undefined) => void
  onQuizTypeChange: (value: QuizType | undefined) => void
  onTopicChange: (value: { topicId?: number; noTopic?: boolean }) => void
  onClear: () => void
  onRefresh: () => void
}) {
  const {
    topics,
    items: topicItems,
    isPending: isTopicsPending,
  } = useTopicOptions()

  // Gõ mượt cục bộ, chỉ ghi vào URL/search param sau khi ngừng gõ 350ms.
  const [draft, setDraft] = useState(q ?? "")
  const debouncedDraft = useDebouncedValue(draft, 350)

  // Chỉ chạy lại khi debouncedDraft đổi — cố tình không đưa q/onSearchChange vào deps,
  // vì onSearchChange kéo theo q đổi và sẽ tạo vòng lặp effect không cần thiết.
  useEffect(() => {
    const trimmed = debouncedDraft.trim()
    if (trimmed !== (q ?? "")) onSearchChange(trimmed || undefined)
  }, [debouncedDraft])

  // Resync khi q đổi từ bên ngoài (nút "Xoá lọc", back/forward trình duyệt).
  // Bỏ qua nếu draft hiện tại (sau trim) đã khớp q — tránh xoá khoảng trắng
  // người dùng vừa gõ ngay khi round-trip debounce ở trên vừa cập nhật q.
  useEffect(() => {
    if (draft.trim() === (q ?? "")) return
    setDraft(q ?? "")
  }, [q])

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
    [NO_TOPIC_VALUE]: NO_TOPIC_LABEL,
    ...topicItems,
  }

  const topicValue = noTopic
    ? NO_TOPIC_VALUE
    : topicId === undefined
      ? ALL_TOPICS_VALUE
      : String(topicId)

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border p-4">
      <div className="flex w-full flex-col gap-2 sm:w-72">
        <Label htmlFor="questions-search">Tìm kiếm</Label>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <IconSearch stroke={1.5} />
          </InputGroupAddon>
          <InputGroupInput
            id="questions-search"
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
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="questions-eng-level">Cấp độ</Label>
        <Select
          items={levelItems}
          value={engLevel ?? ALL_LEVELS_VALUE}
          onValueChange={(value) =>
            onEngLevelChange(
              value === ALL_LEVELS_VALUE ? undefined : (value as EngLevel)
            )
          }
        >
          <SelectTrigger id="questions-eng-level" className="w-40">
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
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="questions-quiz-type">Loại câu</Label>
        <Select
          items={quizTypeItems}
          value={quizType ?? ALL_QUIZ_TYPES_VALUE}
          onValueChange={(value) =>
            onQuizTypeChange(
              value === ALL_QUIZ_TYPES_VALUE ? undefined : (value as QuizType)
            )
          }
        >
          <SelectTrigger id="questions-quiz-type" className="w-52">
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
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="questions-topic">Chủ đề</Label>
        {isTopicsPending ? (
          <Skeleton className="h-9 w-52 rounded-3xl" />
        ) : (
          <Select
            items={topicSelectItems}
            value={topicValue}
            onValueChange={(value) => {
              if (value === ALL_TOPICS_VALUE) onTopicChange({})
              else if (value === NO_TOPIC_VALUE)
                onTopicChange({ noTopic: true })
              else onTopicChange({ topicId: Number(value) })
            }}
          >
            <SelectTrigger id="questions-topic" className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TOPICS_VALUE}>
                {ALL_TOPICS_LABEL}
              </SelectItem>
              <SelectItem value={NO_TOPIC_VALUE}>{NO_TOPIC_LABEL}</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={String(topic.id)}>
                  {topic.displayName ?? topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" onClick={onClear} disabled={!hasActiveFilter}>
          <IconFilterOff stroke={1.5} data-icon="inline-start" />
          Xoá lọc
        </Button>
        <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          <IconRefresh stroke={1.5} data-icon="inline-start" />
          Làm mới
        </Button>
      </div>
    </div>
  )
}
