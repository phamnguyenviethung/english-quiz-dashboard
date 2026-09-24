import { useMemo, useState } from "react"
import { IconSearch, IconTagsOff } from "@tabler/icons-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { TOUCH_ROW } from "@/features/refill/constants.ts"
import type { Topic } from "@/features/topics/hooks/use-topics.ts"
import { cn } from "@/lib/utils"

import { useUpdateTopic } from "../hooks/use-update-topic.ts"

export function BeginnerTopicsPanel({
  topics,
  isPending,
}: {
  topics: Topic[]
  isPending: boolean
}) {
  const [query, setQuery] = useState("")
  const { setForBeginner, pendingTopicId } = useUpdateTopic()

  const visibleTopics = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const filtered = keyword
      ? topics.filter(
          (topic) =>
            topic.name.toLowerCase().includes(keyword) ||
            topic.displayName?.toLowerCase().includes(keyword)
        )
      : topics
    return [...filtered].sort((a, b) => {
      if (a.forBeginner !== b.forBeginner) return a.forBeginner ? -1 : 1
      return (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name)
    })
  }, [topics, query])

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (topics.length === 0) {
    return (
      <Empty className="rounded-2xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconTagsOff stroke={1.5} />
          </EmptyMedia>
          <EmptyTitle>Chưa có chủ đề nào</EmptyTitle>
          <EmptyDescription>
            Tạo chủ đề ở trang Chủ đề trước khi bật cho người mới.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <IconSearch stroke={1.5} />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Tìm chủ đề"
          placeholder="Tìm chủ đề..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </InputGroup>

      <ul className="flex max-h-[26rem] flex-col divide-y overflow-y-auto rounded-2xl border">
        {visibleTopics.map((topic) => {
          const isPendingRow = pendingTopicId === topic.id
          const switchId = `beginner-topic-${topic.id}`
          return (
            <li
              key={topic.id}
              className={cn("flex items-center gap-3 px-3 py-2", TOUCH_ROW)}
            >
              <label
                htmlFor={switchId}
                className="flex min-w-0 flex-1 cursor-pointer flex-col"
              >
                <span className="truncate text-sm font-medium">
                  {topic.displayName ?? topic.name}
                </span>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  #{topic.id} · {topic.name}
                </span>
              </label>
              {isPendingRow ? (
                <Spinner className="size-4 text-muted-foreground" />
              ) : null}
              <Switch
                id={switchId}
                checked={topic.forBeginner}
                disabled={isPendingRow}
                aria-busy={isPendingRow}
                onCheckedChange={(checked) =>
                  void setForBeginner(
                    topic.id,
                    topic.displayName ?? topic.name,
                    checked
                  )
                }
              />
            </li>
          )
        })}
        {visibleTopics.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            Không có chủ đề nào khớp "{query}".
          </li>
        ) : null}
      </ul>
    </div>
  )
}
