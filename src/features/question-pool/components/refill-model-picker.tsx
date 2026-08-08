import { IconAlertTriangle } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import type { AiModel } from "@/features/ai-models/types.ts"
import { formatUsdPerMillion } from "@/lib/format.ts"

/**
 * Chọn model sinh câu. Số model ít (thường 3-8) và mỗi dòng cần hiện thêm modelId +
 * giá, nên bày thẳng ra checkbox thay vì giấu trong dropdown.
 */
export function RefillModelPicker({
  models,
  value,
  isPending,
  disabled,
  onChange,
}: {
  models: AiModel[]
  value: string[]
  isPending: boolean
  disabled?: boolean
  onChange: (modelIds: string[]) => void
}) {
  if (isPending) {
    return (
      <div className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_item, index) => (
          <Skeleton key={index} className="h-9 w-full max-w-56" />
        ))}
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <Alert variant="destructive">
        <IconAlertTriangle stroke={1.5} />
        <AlertTitle>Chưa có model nào dùng được</AlertTitle>
        <AlertDescription>
          Refill thủ công cần ít nhất một model đang bật và cho phép chạy thủ
          công.
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-fit"
            render={<Link to="/ai-models" />}
          >
            Mở quản lý model
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const selected = new Set(value)

  const toggle = (modelId: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(modelId)
    else next.delete(modelId)
    // Giữ thứ tự theo `models` để payload ổn định giữa các lần chọn.
    onChange(models.map((m) => m.modelId).filter((id) => next.has(id)))
  }

  return (
    <div className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-2">
      {models.map((model) => {
        const id = `refill-model-${model.id}`
        return (
          <div key={model.id} className="flex items-start gap-2.5">
            <Checkbox
              id={id}
              className="mt-0.5"
              checked={selected.has(model.modelId)}
              disabled={disabled}
              onCheckedChange={(checked) => toggle(model.modelId, checked)}
            />
            <div className="grid gap-0.5">
              <Label htmlFor={id} className="font-normal">
                {model.key}
              </Label>
              <span className="font-mono text-[11px] text-muted-foreground">
                {model.modelId}
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                vào {formatUsdPerMillion(model.pricePromptPerToken)} · ra{" "}
                {formatUsdPerMillion(model.priceCompletionPerToken)} / 1M token
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
