import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import { useUpdateAiModel } from "../hooks/use-update-ai-model.ts"
import type { AiModel } from "../types.ts"

/**
 * Xác nhận tắt model, dạng controlled không kèm trigger để menu hành động ở mobile
 * mở được nó: AlertDialogTrigger lồng trong DropdownMenuItem sẽ bị unmount ngay
 * khi menu đóng.
 */
export function AiModelDeactivateDialog({
  model,
  open,
  onOpenChange,
}: {
  model: AiModel
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { setActive } = useUpdateAiModel(model.id, {
    successTitle: "Đã tắt model",
  })

  const deactivate = () => {
    void setActive(false).catch(() => {
      // toast đã bắn từ hook
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tắt model "{model.key}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Model ngừng được chọn cho các lượt sinh câu hỏi tiếp theo. Dữ liệu
            không bị xoá, bật lại là dùng được ngay.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel render={<Button variant="outline" />}>
            Huỷ
          </AlertDialogCancel>
          <AlertDialogAction
            render={<Button variant="destructive" onClick={deactivate} />}
          >
            Tắt model
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
