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
 * Chọn model sinh nội dung. Số model ít (thường 3-8) và mỗi dòng cần hiện thêm
 * modelId + giá, nên bày thẳng ra checkbox thay vì giấu trong dropdown.
 */
export function RefillModelPicker({
  models,
  value,
  isPending,
  disabled,
  emptyDescription,
  onChange,
}: {
  models: AiModel[]
  value: string[]
  isPending: boolean
  disabled?: boolean
  /** Điều kiện model backend chấp nhận khác nhau giữa pool và reading. */
  emptyDescription: string
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
          {emptyDescription}
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
        // Cả dòng là label để vùng chạm rộng bằng thẻ, không chỉ mỗi chữ tên model.
        return (
          <Label
            key={model.id}
            htmlFor={id}
            className="flex min-h-11 items-start gap-2.5 rounded-xl font-normal"
          >
            <Checkbox
              id={id}
              className="mt-0.5"
              checked={selected.has(model.modelId)}
              disabled={disabled}
              onCheckedChange={(checked) => toggle(model.modelId, checked)}
            />
            <div className="grid gap-0.5">
              <span className="text-sm">{model.key}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {model.modelId}
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                vào {formatUsdPerMillion(model.pricePromptPerToken)} · ra{" "}
                {formatUsdPerMillion(model.priceCompletionPerToken)} / 1M token
              </span>
            </div>
          </Label>
        )
      })}
    </div>
  )
}
