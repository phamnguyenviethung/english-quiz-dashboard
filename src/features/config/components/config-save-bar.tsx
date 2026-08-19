import { IconAlertTriangle, IconDeviceFloppy } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function ConfigSaveBar({
  dirtyCount,
  errorCount,
  isSaving,
  onDiscard,
  onSave,
}: {
  dirtyCount: number
  errorCount: number
  isSaving: boolean
  onDiscard: () => void
  onSave: () => void
}) {
  if (dirtyCount === 0) return null

  const hasError = errorCount > 0

  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-4xl border bg-background/90 px-4 py-3 shadow-md backdrop-blur-sm">
      {hasError ? (
        <span className="flex items-center gap-2 text-sm text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" stroke={1.5} />
          {errorCount} mục chưa hợp lệ
        </span>
      ) : (
        <span className="text-sm font-medium">
          {dirtyCount} thay đổi chưa lưu
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" disabled={isSaving} onClick={onDiscard}>
          Huỷ
        </Button>
        <Button disabled={isSaving || hasError} onClick={onSave}>
          {isSaving ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <IconDeviceFloppy stroke={1.5} data-icon="inline-start" />
          )}
          Lưu tất cả
        </Button>
      </div>
    </div>
  )
}
