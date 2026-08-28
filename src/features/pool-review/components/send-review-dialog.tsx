import type { ReactElement } from "react"
import { useState } from "react"
import { IconAlertTriangle } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/common/responsive-dialog.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useManualRefillModels } from "@/features/question-pool/hooks/use-manual-refill-models.ts"
import { formatUsdPerMillion } from "@/lib/format.ts"

import { useEnqueueReviews } from "../hooks/use-review-mutations.ts"

const AUTO_MODEL = "auto"
const NOTE_MAX = 1000

export function SendReviewDialog({
  poolQuestionIds,
  trigger,
  onSent,
}: {
  poolQuestionIds: number[]
  trigger: ReactElement
  onSent?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [model, setModel] = useState<string>(AUTO_MODEL)
  const [note, setNote] = useState("")

  const { models, isPending: modelsPending } = useManualRefillModels()
  const { enqueueReviews, isPending: sending } = useEnqueueReviews({
    onSuccess: () => {
      setOpen(false)
      onSent?.()
    },
  })

  const count = poolQuestionIds.length

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      setModel(AUTO_MODEL)
      setNote("")
    }
  }

  const submit = () =>
    void enqueueReviews({
      poolQuestionIds,
      ...(model === AUTO_MODEL ? {} : { model }),
      ...(note.trim() ? { adminNote: note.trim() } : {}),
    })

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogTrigger render={trigger} />
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Gửi AI review</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {count === 1
              ? `Câu #${poolQuestionIds[0]} sẽ được AI rà soát và đề xuất bản sửa, chờ bạn duyệt.`
              : `${count} câu hỏi sẽ được AI rà soát, mỗi câu tạo một review chờ duyệt.`}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="space-y-4">
          <Field>
            <FieldLabel htmlFor="review-model">Model</FieldLabel>
            {modelsPending ? (
              <Skeleton className="h-9 w-full" />
            ) : models.length === 0 ? (
              <Alert variant="destructive">
                <IconAlertTriangle stroke={1.5} />
                <AlertTitle>Chưa có model nào chạy tay được</AlertTitle>
                <AlertDescription>
                  Cần ít nhất một model bật <code>manualEnabled</code>.
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
            ) : (
              <Select
                value={model}
                onValueChange={(value) => setModel(value ?? AUTO_MODEL)}
              >
                <SelectTrigger id="review-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUTO_MODEL}>
                    Tự động (ngẫu nhiên trong model chạy tay)
                  </SelectItem>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.modelId}>
                      {m.key} · vào {formatUsdPerMillion(m.pricePromptPerToken)}{" "}
                      · ra {formatUsdPerMillion(m.priceCompletionPerToken)} / 1M
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FieldDescription>
              Review dùng nhóm model chạy tay (<code>manual</code>).
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="review-note">
              Ghi chú cho AI (không bắt buộc)
            </FieldLabel>
            <Textarea
              id="review-note"
              className="min-h-24"
              maxLength={NOTE_MAX}
              value={note}
              placeholder='VD: "Kiểm tra kỹ đáp án đúng có bị mơ hồ không", "Nghi ví dụ sai thì quá khứ"'
              onChange={(event) => setNote(event.target.value)}
            />
            <FieldDescription>
              AI sẽ soi thêm theo hướng bạn nêu. Bỏ trống nếu chỉ cần review
              tiêu chuẩn. {note.length}/{NOTE_MAX}
            </FieldDescription>
          </Field>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <ResponsiveDialogClose
            render={<Button variant="outline" type="button" />}
          >
            Huỷ
          </ResponsiveDialogClose>
          <Button disabled={sending} onClick={submit}>
            {sending ? <Spinner data-icon="inline-start" /> : null}
            Gửi review
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
