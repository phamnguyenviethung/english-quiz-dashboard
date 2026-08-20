import { useMemo } from "react"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTopicLabel, useTopics } from "@/features/topics/hooks/use-topics.ts"

interface TopicOption {
  id: number
  label: string
}

/**
 * Chọn nhiều chủ đề. Số topic thường 20-40+ nên cần search — dùng Combobox có chips
 * thay vì bày hết ra checkbox như hai chiều engLevel/quizType.
 */
export function RefillTopicPicker({
  value,
  disabled,
  onChange,
}: {
  value: number[]
  disabled?: boolean
  onChange: (topicIds: number[]) => void
}) {
  const { topics, isPending } = useTopics()
  // Popup neo vào khối chips (không phải input bên trong) để rộng đúng bằng ô.
  const anchorRef = useComboboxAnchor()

  const options = useMemo<TopicOption[]>(
    () =>
      topics.map((topic) => ({
        id: topic.id,
        label: formatTopicLabel(topic),
      })),
    [topics]
  )

  const selected = useMemo(
    () => options.filter((option) => value.includes(option.id)),
    [options, value]
  )

  if (isPending) return <Skeleton className="h-9 w-full rounded-3xl" />

  return (
    <Combobox
      items={options}
      multiple
      value={selected}
      disabled={disabled}
      itemToStringLabel={(option: TopicOption) => option.label}
      onValueChange={(next: TopicOption[]) =>
        onChange(next.map((option) => option.id))
      }
    >
      <ComboboxChips ref={anchorRef}>
        <ComboboxValue>
          {(chips: TopicOption[]) =>
            chips.map((option) => (
              <ComboboxChip key={option.id}>{option.label}</ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput placeholder={value.length > 0 ? "" : "Tất cả"} />
      </ComboboxChips>

      <ComboboxContent anchor={anchorRef}>
        <ComboboxEmpty>Không có chủ đề nào khớp.</ComboboxEmpty>
        <ComboboxList>
          {(option: TopicOption) => (
            <ComboboxItem key={option.id} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
