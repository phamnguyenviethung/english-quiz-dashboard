import { IconTrash } from "@tabler/icons-react"

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

export function RevokeApiKeyDialog({
  apiKeyId,
  label,
  disabled,
  onConfirm,
}: {
  apiKeyId: number
  label: string | null
  disabled: boolean
  onConfirm: () => void
}) {
  const name = label ? `"${label}"` : `#${apiKeyId}`

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="sm" disabled={disabled}>
            <IconTrash stroke={1.5} data-icon="inline-start" />
            Thu hồi
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Thu hồi key {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Không hoàn tác được. Mọi client đang dùng key này sẽ nhận 401 ngay
            lập tức, phải cấp key mới để chạy lại.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel render={<Button variant="outline" />}>
            Huỷ
          </AlertDialogCancel>
          <AlertDialogAction
            render={<Button variant="destructive" onClick={onConfirm} />}
          >
            Thu hồi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
