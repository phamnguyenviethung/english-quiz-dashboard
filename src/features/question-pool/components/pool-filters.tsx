import { IconEye, IconRefresh } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useTopicOptions } from "@/features/topics/hooks/use-topics.ts"

import {
  ALL_TOPICS_LABEL,
  ALL_TOPICS_VALUE,
  ENG_LEVELS,
  OPTION_COUNTS,
  formatOptionCountLabel,
} from "../constants.ts"
import type { EngLevel, OptionCount } from "../types.ts"

export function PoolFilters({
  engLevel,
  topicId,
  optionCount,
  isRefreshing,
  onEngLevelChange,
  onTopicChange,
  onOptionCountChange,
  onRefresh,
  onPreview,
}: {
  engLevel: EngLevel
  topicId: number | undefined
  optionCount: OptionCount
  isRefreshing: boolean
  onEngLevelChange: (value: EngLevel) => void
  onTopicChange: (value: number | undefined) => void
  onOptionCountChange: (value: OptionCount) => void
  onRefresh: () => void
  onPreview: () => void
}) {
  const { topics, items, isPending: isTopicsPending } = useTopicOptions()

  const topicItems = { [ALL_TOPICS_VALUE]: ALL_TOPICS_LABEL, ...items }
  const levelItems = Object.fromEntries(
    ENG_LEVELS.map((level) => [level, level])
  )
  const optionCountItems = Object.fromEntries(
    OPTION_COUNTS.map((count) => [String(count), formatOptionCountLabel(count)])
  )

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-eng-level">Cấp độ</Label>
        <Select
          items={levelItems}
          value={engLevel}
          onValueChange={(value) => onEngLevelChange(value as EngLevel)}
        >
          <SelectTrigger id="filter-eng-level" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENG_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-topic">Chủ đề</Label>
        {isTopicsPending ? (
          <Skeleton className="h-9 w-52 rounded-3xl" />
        ) : (
          <Select
            items={topicItems}
            value={topicId === undefined ? ALL_TOPICS_VALUE : String(topicId)}
            onValueChange={(value) =>
              onTopicChange(
                value === ALL_TOPICS_VALUE ? undefined : Number(value)
              )
            }
          >
            <SelectTrigger id="filter-topic" className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TOPICS_VALUE}>
                {ALL_TOPICS_LABEL}
              </SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={String(topic.id)}>
                  {topic.displayName ?? topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-option-count">Số đáp án</Label>
        <Select
          items={optionCountItems}
          value={String(optionCount)}
          onValueChange={(value) =>
            onOptionCountChange(Number(value) as OptionCount)
          }
        >
          <SelectTrigger id="filter-option-count" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPTION_COUNTS.map((count) => (
              <SelectItem key={count} value={String(count)}>
                {formatOptionCountLabel(count)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          <IconRefresh stroke={1.5} data-icon="inline-start" />
          Làm mới
        </Button>
        <Button variant="secondary" onClick={onPreview}>
          <IconEye stroke={1.5} data-icon="inline-start" />
          Xem câu mẫu
        </Button>
      </div>
    </div>
  )
}
