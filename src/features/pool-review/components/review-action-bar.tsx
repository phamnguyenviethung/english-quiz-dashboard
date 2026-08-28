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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

import {
  useApproveReview,
  useDeleteReview,
  useRejectReview,
} from "../hooks/use-review-mutations.ts"
import type { PoolReviewDetail } from "../types.ts"

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
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [draftError, setDraftError] = useState<string | undefined>()

  const isPending = review.status === "pending"
  const canApprove = isPending && review.checklist?.formatValid !== false

  const openEditor = () => {
    setDraft(JSON.stringify(review.revised ?? {}, null, 2))
    setDraftError(undefined)
    setEditing(true)
  }

  const submitEdited = async () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(draft)
    } catch {
      setDraftError("JSON không hợp lệ.")
      return
    }
    await approveReview(review.id, { data: parsed })
    setEditing(false)
  }

  if (!isPending) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border p-3">
        <p className="text-sm text-muted-foreground">
          Review đã được xử lý ({review.status}). Không thể duyệt/từ chối lại.
        </p>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="ghost" size="sm" disabled={deleting}>
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
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-2xl border p-3">
      {review.checklist?.formatValid === false ? (
        <p className="rounded-xl bg-rose-500/10 p-2 text-sm text-rose-700 dark:text-rose-300">
          Bản sửa của AI không đúng schema câu hỏi. Sửa tay trước khi duyệt.
        </p>
      ) : null}

      {editing ? (
        <div className="space-y-2">
          <Field>
            <FieldLabel htmlFor="review-edit-json">
              Sửa dữ liệu câu hỏi (JSON)
            </FieldLabel>
            <Textarea
              id="review-edit-json"
              className="min-h-64 font-mono text-xs"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <FieldDescription>
              Sẽ được validate lại theo schema `{review.quizType}` ở server.
            </FieldDescription>
            {draftError ? (
              <p className="text-sm text-destructive">{draftError}</p>
            ) : null}
          </Field>
          <div className="flex gap-2">
            <Button disabled={approving} onClick={() => void submitEdited()}>
              {approving ? <Spinner data-icon="inline-start" /> : null}
              Duyệt bản đã sửa
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Huỷ
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
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
                  Ghi đè câu #{review.poolQuestionRefId} trong pool bằng bản AI
                  đã sửa. Không tự hoàn tác được.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel render={<Button variant="outline" />}>
                  Huỷ
                </AlertDialogCancel>
                <AlertDialogAction
                  render={
                    <Button onClick={() => void approveReview(review.id)} />
                  }
                >
                  Duyệt
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" onClick={openEditor}>
            <IconPencil stroke={1.5} data-icon="inline-start" />
            Sửa tay trước khi duyệt
          </Button>

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
                <AlertDialogTitle>
                  Từ chối review #{review.id}?
                </AlertDialogTitle>
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
        </div>
      )}
    </div>
  )
}
