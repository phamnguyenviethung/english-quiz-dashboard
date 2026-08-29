import { useState } from "react"
import { IconPencil } from "@tabler/icons-react"

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
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

import { useApproveReview } from "../hooks/use-review-mutations.ts"
import type { PoolReviewDetail } from "../types.ts"

/**
 * Sửa tay bản AI đề xuất rồi duyệt luôn. Tách khỏi hàng nút vì textarea JSON cần
 * cả màn hình — trên điện thoại `ResponsiveDialog` tự thành drawer đáy.
 */
export function ReviewEditJsonDialog({
  review,
  onResolved,
}: {
  review: PoolReviewDetail
  onResolved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [draftError, setDraftError] = useState<string | undefined>()

  const { approveReview, isPending } = useApproveReview({
    onSuccess: onResolved,
  })

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft(JSON.stringify(review.revised ?? {}, null, 2))
      setDraftError(undefined)
    }
    setOpen(next)
  }

  const submit = async () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(draft)
    } catch {
      setDraftError("JSON không hợp lệ.")
      return
    }
    setDraftError(undefined)
    await approveReview(review.id, { data: parsed })
    setOpen(false)
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogTrigger
        render={
          <Button variant="outline">
            <IconPencil stroke={1.5} data-icon="inline-start" />
            Sửa tay trước khi duyệt
          </Button>
        }
      />
      <ResponsiveDialogContent className="sm:max-w-2xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            Sửa tay review #{review.id}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Duyệt xong sẽ ghi đè câu #{review.poolQuestionRefId} trong pool bằng
            nội dung dưới đây.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <Field data-invalid={draftError !== undefined || undefined}>
            <FieldLabel htmlFor="review-edit-json">
              Dữ liệu câu hỏi (JSON)
            </FieldLabel>
            <Textarea
              id="review-edit-json"
              rows={14}
              className="font-mono text-xs md:min-h-80"
              value={draft}
              disabled={isPending}
              onChange={(event) => setDraft(event.target.value)}
            />
            <FieldDescription>
              Sẽ được validate lại theo schema `{review.quizType}` ở server.
            </FieldDescription>
            {draftError ? (
              <p className="text-sm text-destructive">{draftError}</p>
            ) : null}
          </Field>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <ResponsiveDialogClose
            render={
              <Button variant="outline" type="button" disabled={isPending} />
            }
          >
            Huỷ
          </ResponsiveDialogClose>
          <Button disabled={isPending} onClick={() => void submit()}>
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Duyệt bản đã sửa
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
