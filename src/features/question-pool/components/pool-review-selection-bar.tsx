import { IconSparkles, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { SendReviewDialog } from "@/features/pool-review/components/send-review-dialog.tsx"

const BATCH_MAX = 30

/**
 * Thanh chọn hàng loạt — hiện khi có câu được tick. Dính đáy ở mobile, nằm trong
 * luồng ở desktop. `SendReviewDialog` mở ở cấp trang nên không có overlay nào phía dưới.
 */
export function PoolReviewSelectionBar({
  selectedIds,
  onClear,
}: {
  selectedIds: number[]
  onClear: () => void
}) {
  if (selectedIds.length === 0) return null

  const overLimit = selectedIds.length > BATCH_MAX

  return (
    <div className="sticky bottom-0 z-10 -mx-4 -mb-4 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:-mx-6 md:-mb-6 md:px-6 lg:static lg:-mx-0 lg:-mb-0 lg:rounded-2xl lg:border lg:py-3 lg:backdrop-blur-none">
      <p className="text-sm">
        <span className="font-semibold tabular-nums">{selectedIds.length}</span>{" "}
        câu đã chọn
        {overLimit ? (
          <span className="ml-1 text-destructive">
            · tối đa {BATCH_MAX} câu / lần
          </span>
        ) : null}
      </p>

      <Button variant="ghost" size="sm" onClick={onClear}>
        <IconX stroke={1.5} data-icon="inline-start" />
        Bỏ chọn
      </Button>

      <SendReviewDialog
        poolQuestionIds={selectedIds}
        onSent={onClear}
        trigger={
          <Button
            size="sm"
            className="ml-auto min-h-11 sm:min-h-9"
            disabled={overLimit}
          >
            <IconSparkles stroke={1.5} data-icon="inline-start" />
            Gửi AI review
          </Button>
        }
      />
    </div>
  )
}
