import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FILTER_PILL,
  FILTER_PILL_ACTIVE,
  FILTER_PILL_LABEL,
} from "@/features/topics/constants.ts"
import { cn } from "@/lib/utils"

import {
  AUDIENCE_LABELS,
  audienceToForBeginner,
  forBeginnerToAudience,
} from "../constants.ts"
import type { AudienceValue } from "../constants.ts"

const ITEMS: Record<AudienceValue, string> = {
  all: "Tất cả",
  beginner: AUDIENCE_LABELS.beginner,
  standard: AUDIENCE_LABELS.standard,
}

export function BeginnerFilterPill({
  value,
  onChange,
}: {
  value: boolean | undefined
  onChange: (value: boolean | undefined) => void
}) {
  return (
    <Select
      items={ITEMS}
      value={forBeginnerToAudience(value)}
      onValueChange={(next) => onChange(audienceToForBeginner(next ?? "all"))}
    >
      <SelectTrigger
        aria-label="Lọc theo đối tượng"
        className={cn(FILTER_PILL, value !== undefined && FILTER_PILL_ACTIVE)}
      >
        <span className={FILTER_PILL_LABEL}>Đối tượng:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả đối tượng</SelectItem>
        <SelectItem value="beginner">Người mới</SelectItem>
        <SelectItem value="standard">Thường</SelectItem>
      </SelectContent>
    </Select>
  )
}
