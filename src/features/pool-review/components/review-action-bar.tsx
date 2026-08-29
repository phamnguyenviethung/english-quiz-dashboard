import { useState } from "react"
import { IconCheck, IconX } from "@tabler/icons-react"

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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

import {
  useApproveReview,
  useDeleteReview,
  useRejectReview,
} from "../hooks/use-review-mutations.ts"
import type { PoolReviewDetail } from "../types.ts"
import { ReviewEditJsonDialog } from "./review-edit-json-dialog.tsx"

/**
 * Chỉ trả về các nút, để đặt trực tiếp vào `DetailDialogFooter` — footer ép con
 * trực tiếp thành full-width trên điện thoại nên không được bọc thêm thẻ nào.
 * Phần chữ giải thích trạng thái nằm ở body, xem `ReviewStatusNotice`.
 */
export function ReviewActionBar({
  review,
  onResolved,
}: {
  review: PoolReviewDetail
  onResolved: () => void
}) {
  const { approveReview, isPending: approving } = useApproveReview({
    onSuccess: onResolved,
  })
  const { rejectReview, isPending: rejecting } = useRejectReview({
    onSuccess: onResolved,
  })
  const { deleteReview, isPending: deleting } = useDeleteReview({
    onSuccess: onResolved,
  })

  const [note, setNote] = useState("")

  const isPending = review.status === "pending"
  const canApprove = isPending && review.checklist?.formatValid !== false

  if (!isPending) {
    return (
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="outline" disabled={deleting}>
              <IconX stroke={1.5} data-icon="inline-start" />
              Xoá review
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá review #{review.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              Chỉ xoá bản ghi review này, không ảnh hưởng câu trong pool.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button variant="outline" />}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              render={
                <Button
                  variant="destructive"
                  onClick={() => void deleteReview(review.id)}
                />
              }
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="ghost" disabled={rejecting}>
              <IconX stroke={1.5} data-icon="inline-start" />
              Từ chối
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối review #{review.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              Giữ nguyên câu trong pool, chỉ đánh dấu review là đã từ chối.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Field>
            <FieldLabel htmlFor="review-reject-note">
              Ghi chú (không bắt buộc)
            </FieldLabel>
            <Input
              id="review-reject-note"
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Lý do từ chối…"
            />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button variant="outline" />}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              render={
                <Button
                  variant="destructive"
                  onClick={() =>
                    void rejectReview(review.id, {
                      note: note.trim() || undefined,
                    })
                  }
                />
              }
            >
              Từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReviewEditJsonDialog review={review} onResolved={onResolved} />

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button disabled={!canApprove || approving}>
              {approving ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <IconCheck stroke={1.5} data-icon="inline-start" />
              )}
              Duyệt bản AI sửa
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duyệt review #{review.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              Ghi đè câu #{review.poolQuestionRefId} trong pool bằng bản AI đã
              sửa. Không tự hoàn tác được.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button variant="outline" />}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              render={<Button onClick={() => void approveReview(review.id)} />}
            >
              Duyệt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/** Lý do vì sao hàng nút ở footer bị giới hạn — đặt ở cuối body. */
export function ReviewStatusNotice({ review }: { review: PoolReviewDetail }) {
  if (review.status !== "pending") {
    return (
      <p className="rounded-2xl border p-3 text-sm text-muted-foreground">
        Review đã được xử lý ({review.status}). Không thể duyệt/từ chối lại.
      </p>
    )
  }

  if (review.checklist?.formatValid === false) {
    return (
      <p className="rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
        Bản sửa của AI không đúng schema câu hỏi. Sửa tay trước khi duyệt.
      </p>
    )
  }

  return null
}
