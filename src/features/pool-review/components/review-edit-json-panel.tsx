import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

import { useApproveReview } from "../hooks/use-review-mutations.ts"
import type { PoolReviewDetail } from "../types.ts"

/**
 * Sửa tay bản AI đề xuất rồi duyệt luôn — inline trong tab, không phải dialog.
 */
export function ReviewEditJsonPanel({
  review,
  onApproved,
}: {
  review: PoolReviewDetail
  onApproved: () => void
}) {
  const aiJson = () => JSON.stringify(review.revised ?? {}, null, 2)
  const [draft, setDraft] = useState(aiJson)
  const [error, setError] = useState<string | undefined>()

  const { approveReview, isPending } = useApproveReview()
  const isResolved = review.status !== "pending"

  const submit = async () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(draft)
    } catch {
      setError("JSON không hợp lệ.")
      return
    }
    setError(undefined)
    try {
      await approveReview(review.id, { data: parsed })
    } catch {
      return
    }
    onApproved()
  }

  return (
    <div className="space-y-3">
      <Field data-invalid={error !== undefined || undefined}>
        <FieldLabel htmlFor="review-edit-json">
          Dữ liệu câu hỏi (JSON)
        </FieldLabel>
        <Textarea
          id="review-edit-json"
          rows={18}
          className="font-mono text-xs md:min-h-96"
          value={draft}
          disabled={isPending || isResolved}
          onChange={(event) => setDraft(event.target.value)}
        />
        <FieldDescription>
          Duyệt sẽ validate lại theo schema <code>{review.quizType}</code> ở
          server rồi ghi đè câu #{review.poolQuestionRefId}.
        </FieldDescription>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={isPending || isResolved}
          onClick={() => {
            setDraft(aiJson())
            setError(undefined)
          }}
        >
          Khôi phục bản AI
        </Button>
        <Button
          disabled={isPending || isResolved}
          onClick={() => void submit()}
        >
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          Duyệt bản đã sửa
        </Button>
      </div>
    </div>
  )
}
