import { IconInfoCircle, IconSeedling } from "@tabler/icons-react"

import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"

export function BeginnerToggleRow({
  checked,
  isPending,
  ineligibleReason,
  description,
  onCheckedChange,
}: {
  checked: boolean
  isPending: boolean
  /** Có lý do → chỉ cho tắt, không cho bật (API sẽ trả 400). */
  ineligibleReason?: string
  description: { on: string; off: string }
  onCheckedChange: (checked: boolean) => void
}) {
  const isLocked = !checked && Boolean(ineligibleReason)

  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border p-3 text-sm">
      <span className="flex min-w-0 items-start gap-2">
        <IconSeedling
          className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
          stroke={1.5}
          aria-hidden
        />
        <span className="min-w-0">
          Dành cho người mới
          <span className="block text-xs text-muted-foreground">
            {checked ? description.on : description.off}
          </span>
          {isLocked ? (
            <span className="mt-1 flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
              <IconInfoCircle
                className="size-3.5 shrink-0"
                stroke={1.5}
                aria-hidden
              />
              {ineligibleReason}
            </span>
          ) : null}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {isPending ? (
          <Spinner className="size-4 text-muted-foreground" />
        ) : null}
        <Switch
          checked={checked}
          disabled={isPending || isLocked}
          aria-busy={isPending}
          onCheckedChange={onCheckedChange}
        />
      </span>
    </label>
  )
}
