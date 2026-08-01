import { IconRestore } from "@tabler/icons-react"

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

export function ResetConfigDialog({
  label,
  disabled,
  onConfirm,
}: {
  label: string
  disabled: boolean
  onConfirm: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="sm" disabled={disabled}>
            <IconRestore stroke={1.5} data-icon="inline-start" />
            Đặt lại mặc định
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Đặt lại "{label}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Giá trị hiện tại sẽ bị thay bằng giá trị mặc định của hệ thống. Hành
            động này áp dụng ngay cho bot.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel render={<Button variant="outline" />}>
            Huỷ
          </AlertDialogCancel>
          <AlertDialogAction render={<Button onClick={onConfirm} />}>
            Đặt lại
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
