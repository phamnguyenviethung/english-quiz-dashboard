import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import { useUpdateAiModel } from "../hooks/use-update-ai-model.ts"
import type { AiModel } from "../types.ts"

export function AiModelStatusToggle({ model }: { model: AiModel }) {
  const { setActive, isPending } = useUpdateAiModel(model.id, {
    successTitle: model.isActive ? "Đã tắt model" : "Đã bật lại model",
  })

  const toggle = (isActive: boolean) => {
    void setActive(isActive).catch(() => {
      // toast đã bắn từ hook
    })
  }

  if (!model.isActive) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => toggle(true)}
      >
        <IconPlayerPlay stroke={1.5} data-icon="inline-start" />
        Bật lại
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" disabled={isPending}>
            <IconPlayerPause stroke={1.5} data-icon="inline-start" />
            Tắt
          </Button>
        }
      />
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
            render={
              <Button variant="destructive" onClick={() => toggle(false)} />
            }
          >
            Tắt model
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
