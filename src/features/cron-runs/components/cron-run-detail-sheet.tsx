import { QueryError } from "@/components/common/query-error.tsx"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

import { useCronRunDetail } from "../hooks/use-cron-run-detail.ts"
import { groupAttemptsByBucket } from "../utils/summarize-cron-run.ts"
import { CronRunAttemptsTable } from "./cron-run-attempts-table.tsx"
import { CronRunBucketsTable } from "./cron-run-buckets-table.tsx"
import { CronRunSummary } from "./cron-run-summary.tsx"

export function CronRunDetailSheet({
  runId,
  onOpenChange,
}: {
  runId: string | undefined
  onOpenChange: (open: boolean) => void
}) {
  const { detail, isPending, isError, error, refetch } = useCronRunDetail(runId)

  return (
    <Sheet open={Boolean(runId)} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-3xl!">
        <SheetHeader>
          <SheetTitle>Chi tiết lượt chạy</SheetTitle>
          <SheetDescription>
            Tổng hợp bucket và các lần gọi model trong lượt chạy này.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {isError ? (
            <QueryError
              title="Không tải được chi tiết"
              error={error}
              onRetry={() => void refetch()}
            />
          ) : isPending || !detail ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <>
              <CronRunSummary run={detail.run} />

              <section className="space-y-2">
                <h3 className="text-sm font-medium">
                  Buckets ({detail.buckets.length})
                </h3>
                <CronRunBucketsTable
                  buckets={detail.buckets}
                  attemptsByBucket={groupAttemptsByBucket(detail.attempts)}
                />
                {detail.hasNextBuckets ? (
                  <p className="text-xs text-muted-foreground">
                    Còn bucket chưa hiển thị, API giới hạn số bucket trả về mỗi
                    lần.
                  </p>
                ) : null}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-medium">
                  Lượt gọi model ({detail.attempts.length})
                </h3>
                <CronRunAttemptsTable attempts={detail.attempts} />
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
