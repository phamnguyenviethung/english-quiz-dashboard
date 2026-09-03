import { useState } from "react"
import {
  IconCopy,
  IconDotsVertical,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { copyText } from "@/lib/clipboard.ts"

import { useUpdateAiModel } from "../hooks/use-update-ai-model.ts"
import type { AiModel } from "../types.ts"
import { AiModelDeactivateDialog } from "./ai-model-deactivate-dialog.tsx"
import { AiModelFormDialog } from "./ai-model-form-dialog.tsx"

/**
 * Hành động của một model.
 * Ở màn hình nhỏ (mobile card): hiển thị nút 3 chấm dropdown gọn gàng.
 * Ở màn hình lớn (desktop table): hiển thị các icon/nút trực tiếp để thao tác 1 chạm.
 */
export function AiModelRowActions({
  model,
  isSyncing,
  onSyncPricing,
}: {
  model: AiModel
  isSyncing: boolean
  onSyncPricing: () => void
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const { setActive, isPending: isTogglingActive } = useUpdateAiModel(
    model.id,
    {
      successTitle: "Đã bật lại model",
    }
  )

  const handleToggleActive = () => {
    if (model.isActive) {
      setDeactivateOpen(true)
      return
    }
    void setActive(true).catch(() => {
      // toast đã bắn từ hook
    })
  }

  const handleCopyId = async () => {
    const ok = await copyText(model.modelId)
    if (ok) {
      toast.add({
        type: "info",
        title: "Đã sao chép Model ID",
        description: model.modelId,
      })
    }
  }

  return (
    <>
      {/* Mobile Dropdown View */}
      <div className="flex justify-end md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label={`Hành động cho model ${model.key}`}
              >
                <IconDotsVertical className="size-4" stroke={1.5} />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCopyId}>
              <IconCopy className="size-4" stroke={1.5} />
              Sao chép ID
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isSyncing} onClick={onSyncPricing}>
              {isSyncing ? (
                <Spinner />
              ) : (
                <IconRefresh className="size-4" stroke={1.5} />
              )}
              Đồng bộ giá
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFormOpen(true)}>
              <IconPencil className="size-4" stroke={1.5} />
              Chỉnh sửa model
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant={model.isActive ? "destructive" : "default"}
              disabled={isTogglingActive}
              onClick={handleToggleActive}
            >
              {model.isActive ? (
                <IconPlayerPause className="size-4" stroke={1.5} />
              ) : (
                <IconPlayerPlay className="size-4" stroke={1.5} />
              )}
              {model.isActive ? "Tắt model" : "Bật lại model"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Direct Actions View */}
      <div className="hidden items-center justify-end gap-1.5 md:flex">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 text-muted-foreground hover:text-foreground"
                aria-label={`Đồng bộ giá model ${model.key}`}
                disabled={isSyncing}
                onClick={onSyncPricing}
              >
                {isSyncing ? (
                  <Spinner />
                ) : (
                  <IconRefresh className="size-4" stroke={1.5} />
                )}
              </Button>
            }
          />
          <TooltipContent>Đồng bộ giá từ OpenRouter</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 text-muted-foreground hover:text-foreground"
                aria-label={`Sửa model ${model.key}`}
                onClick={() => setFormOpen(true)}
              >
                <IconPencil className="size-4" stroke={1.5} />
              </Button>
            }
          />
          <TooltipContent>Chỉnh sửa cấu hình</TooltipContent>
        </Tooltip>

        <Button
          variant={model.isActive ? "outline" : "default"}
          size="sm"
          className="h-8 px-2.5 text-xs"
          disabled={isTogglingActive}
          onClick={handleToggleActive}
        >
          {model.isActive ? (
            <IconPlayerPause
              className="size-3.5"
              stroke={1.5}
              data-icon="inline-start"
            />
          ) : (
            <IconPlayerPlay
              className="size-3.5"
              stroke={1.5}
              data-icon="inline-start"
            />
          )}
          {model.isActive ? "Tắt" : "Bật lại"}
        </Button>
      </div>

      <AiModelFormDialog
        model={model}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
      <AiModelDeactivateDialog
        model={model}
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
      />
    </>
  )
}
