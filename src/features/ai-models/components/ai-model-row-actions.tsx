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

import { useUpdateAiModel } from "../hooks/use-update-ai-model.ts"
import type { AiModel } from "../types.ts"
import { AiModelDeactivateDialog } from "./ai-model-deactivate-dialog.tsx"
import { AiModelFormDialog } from "./ai-model-form-dialog.tsx"

/**
 * Ba hành động của một model, luôn gom trong một nút 44px ở mọi kích thước: các
 * thao tác này thưa, còn giữ hai bản nút-rời/menu là chỗ đẻ ra phức tạp responsive.
 * Dialog để ở dạng controlled vì AlertDialogTrigger lồng trong DropdownMenuItem
 * sẽ bị unmount ngay khi menu đóng.
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label={`Hành động cho model ${model.key}`}
            />
          }
        >
          <IconDotsVertical stroke={1.5} />
        </DropdownMenuTrigger>
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
