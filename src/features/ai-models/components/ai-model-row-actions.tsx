import { useState } from "react"
import {
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useUpdateAiModel } from "../hooks/use-update-ai-model.ts"
import type { AiModel } from "../types.ts"
import { AiModelDeactivateDialog } from "./ai-model-deactivate-dialog.tsx"
import { AiModelFormDialog } from "./ai-model-form-dialog.tsx"

/**
 * Ba hành động của một hàng. Ở điện thoại chúng gom vào một nút 44px để cột ghim
 * bên phải không nuốt mất màn hình; từ md trở lên vẫn là ba nút rời như cũ. Hai
 * nhánh ẩn/hiện bằng CSS nhưng dùng chung một bộ dialog controlled bên dưới nên
 * state không bị nhân đôi.
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

  return (
    <>
      <div className="flex justify-end md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={`Hành động cho model ${model.key}`}
              >
                <IconDotsVertical stroke={1.5} />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={isSyncing} onClick={onSyncPricing}>
              {isSyncing ? <Spinner /> : <IconRefresh stroke={1.5} />}
              Đồng bộ giá
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFormOpen(true)}>
              <IconPencil stroke={1.5} />
              Sửa model
            </DropdownMenuItem>
            <DropdownMenuItem
              variant={model.isActive ? "destructive" : "default"}
              disabled={isTogglingActive}
              onClick={handleToggleActive}
            >
              {model.isActive ? (
                <IconPlayerPause stroke={1.5} />
              ) : (
                <IconPlayerPlay stroke={1.5} />
              )}
              {model.isActive ? "Tắt model" : "Bật lại model"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="hidden justify-end gap-2 md:flex">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Đồng bộ giá model ${model.key}`}
                disabled={isSyncing}
                onClick={onSyncPricing}
              >
                {isSyncing ? <Spinner /> : <IconRefresh stroke={1.5} />}
              </Button>
            }
          />
          <TooltipContent>Đồng bộ giá</TooltipContent>
        </Tooltip>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={`Sửa model ${model.key}`}
          onClick={() => setFormOpen(true)}
        >
          <IconPencil stroke={1.5} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isTogglingActive}
          onClick={handleToggleActive}
        >
          {model.isActive ? (
            <IconPlayerPause stroke={1.5} data-icon="inline-start" />
          ) : (
            <IconPlayerPlay stroke={1.5} data-icon="inline-start" />
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
