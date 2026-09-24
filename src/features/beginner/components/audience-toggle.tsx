import { IconSeedling, IconStack2, IconUsers } from "@tabler/icons-react"
import type { Icon } from "@tabler/icons-react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TOUCH_TOGGLE } from "@/features/refill/constants.ts"

import { AUDIENCE_LABELS, AUDIENCE_VALUES } from "../constants.ts"
import type { AudienceValue } from "../constants.ts"

const AUDIENCE_ICONS: Record<AudienceValue, Icon> = {
  all: IconStack2,
  standard: IconUsers,
  beginner: IconSeedling,
}

export function AudienceToggle({
  value,
  onChange,
  disabled,
  ariaLabel = "Đối tượng",
}: {
  value: AudienceValue
  onChange: (value: AudienceValue) => void
  disabled?: boolean
  ariaLabel?: string
}) {
  return (
    <ToggleGroup
      variant="outline"
      className="flex-wrap"
      aria-label={ariaLabel}
      value={[value]}
      disabled={disabled}
      onValueChange={(next) => {
        const picked = next[0] as AudienceValue | undefined
        if (picked) onChange(picked)
      }}
    >
      {AUDIENCE_VALUES.map((item) => {
        const ItemIcon = AUDIENCE_ICONS[item]
        return (
          <ToggleGroupItem key={item} value={item} className={TOUCH_TOGGLE}>
            <ItemIcon stroke={1.5} aria-hidden />
            {AUDIENCE_LABELS[item]}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
