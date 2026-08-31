import { useState } from "react"
import { IconCheck, IconPencil, IconX } from "@tabler/icons-react"

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
import type { useReviewSiblings } from "../hooks/use-review-siblings.ts"
import type { PoolReviewDetail } from "../types.ts"

type Siblings = ReturnType<typeof useReviewSiblings>

/**
 * Chỉ trả về các nút — khung (rail dọc ở desktop / bar đáy ở mobile) do cha dựng.
 * Mỗi thao tác phá huỷ đi qua đúng MỘT lớp AlertDialog, không lồng modal.
 */
export function ReviewActions({
  review,
  siblings,
  onGoEdit,
  onDone,
}: {
  review: PoolReviewDetail
  siblings: Siblings
  onGoEdit: () => void
  onDone: () => void
}) {
  const { approveReview, isPending: approving } = useApproveReview()
  const { rejectReview, isPending: rejecting } = useRejectReview()
  const { deleteReview, isPending: deleting } = useDeleteReview()
  const [rejectNote, setRejectNote] = useState("")

  const isPending = review.status === "pending"
  const canApprove = isPending && review.checklist?.formatValid !== false
  const busy = approving || rejecting || deleting

  const advance = () => {
    if (siblings.hasNext) siblings.gotoNext()
    else onDone()
  }

  const runApprove = async (thenNext: boolean) => {
    try {
      await approveReview(review.id)
    } catch {
      return
    }
    if (thenNext) advance()
    else onDone()
  }

  const runReject = async () => {
    try {
      await rejectReview(review.id, {
        note: rejectNote.trim() || undefined,
      })
    } catch {
      return
    }
    setRejectNote("")
    advance()
  }

  const runDelete = async () => {
    try {
      await deleteReview(review.id)
    } catch {
      return
    }
    onDone()
  }

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
        <AlertDialogContent size="sm">
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
                  onClick={() => void runDelete()}
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
            <Button variant="ghost" disabled={busy}>
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
              value={rejectNote}
              onChange={(event) => setRejectNote(event.target.value)}
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
                  onClick={() => void runReject()}
                />
              }
            >
              Từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="outline" disabled={busy} onClick={onGoEdit}>
        <IconPencil stroke={1.5} data-icon="inline-start" />
        Sửa tay
      </Button>

      {canApprove ? (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button disabled={busy}>
                {approving ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <IconCheck stroke={1.5} data-icon="inline-start" />
                )}
                Duyệt
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
              {siblings.hasNext ? (
                <AlertDialogAction
                  render={
                    <Button
                      variant="outline"
                      onClick={() => void runApprove(true)}
                    />
                  }
                >
                  Duyệt & câu kế
                </AlertDialogAction>
              ) : null}
              <AlertDialogAction
                render={<Button onClick={() => void runApprove(false)} />}
              >
                Duyệt
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          disabled
          title="Bản AI sửa sai schema — sửa tay trước khi duyệt."
        >
          <IconCheck stroke={1.5} data-icon="inline-start" />
          Duyệt
        </Button>
      )}
    </>
  )
}
