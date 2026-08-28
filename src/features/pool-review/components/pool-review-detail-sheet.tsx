import { IconAlertTriangle } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getEngLevelBadgeClass,
  getQuizTypeLabel,
} from "@/features/quiz/constants.ts"
import { formatDateTime, formatNumber } from "@/lib/format.ts"

import { getReviewSeverityMeta } from "../constants.ts"
import { usePoolReview } from "../hooks/use-pool-review.ts"
import type { PoolReviewDetail } from "../types.ts"
import { QuestionDiffView } from "./question-diff-view.tsx"
import { ReviewActionBar } from "./review-action-bar.tsx"
import { ReviewChecklist } from "./review-checklist.tsx"
import { ReviewStatusBadge, ReviewVerdictBadge } from "./review-badges.tsx"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function IssuesList({ issues }: { issues: PoolReviewDetail["issues"] }) {
  if (!issues || issues.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">AI không nêu vấn đề nào.</p>
    )
  }
  return (
    <ul className="space-y-2">
      {issues.map((issue, index) => {
        const severity = getReviewSeverityMeta(issue.severity)
        return (
          <li key={index} className="rounded-2xl border p-3 text-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-mono text-xs">{issue.field}</span>
              <Badge variant="outline" className={severity.className}>
                {severity.label}
              </Badge>
            </div>
            <p>{issue.problem}</p>
            {issue.fix ? (
              <p className="mt-1 text-muted-foreground">
                <span className="font-medium">Đã sửa:</span> {issue.fix}
              </p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

function DetailBody({
  review,
  onResolved,
}: {
  review: PoolReviewDetail
  onResolved: () => void
}) {
  return (
    <div className="space-y-6 px-4 pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{getQuizTypeLabel(review.quizType)}</Badge>
        <Badge
          variant="outline"
          className={getEngLevelBadgeClass(review.engLevel)}
        >
          {review.engLevel}
        </Badge>
        <ReviewStatusBadge status={review.status} />
        <ReviewVerdictBadge verdict={review.verdict} />
        <span className="text-sm text-muted-foreground">
          {review.topicName ?? "Không chủ đề"}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-2xl border p-4 sm:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Câu trong pool</dt>
          <dd className="text-sm tabular-nums">#{review.poolQuestionRefId}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Điểm bản gốc</dt>
          <dd className="text-sm tabular-nums">
            {review.score === null ? "-" : `${review.score}/100`}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Token</dt>
          <dd className="text-sm tabular-nums">
            {formatNumber(review.tokenIn)} / {formatNumber(review.tokenOut)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Tạo lúc</dt>
          <dd className="text-sm tabular-nums">
            {formatDateTime(review.createdAt)}
          </dd>
        </div>
        <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-4">
          <dt className="text-xs text-muted-foreground">Model review</dt>
          <dd className="font-mono text-sm break-all">{review.reviewModel}</dd>
        </div>
      </dl>

      {review.status === "failed" ? (
        <div className="flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <IconAlertTriangle
            stroke={1.5}
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <div>
            <p className="font-medium">Review thất bại</p>
            <p className="text-muted-foreground">
              {review.errorMessage ?? "Không rõ nguyên nhân."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {review.summary ? (
            <Section title="Tóm tắt">
              <p className="text-sm whitespace-pre-wrap">{review.summary}</p>
            </Section>
          ) : null}

          <Section title="Checklist thay đổi">
            <ReviewChecklist checklist={review.checklist} />
          </Section>

          <Section title="Vấn đề phát hiện">
            <IssuesList issues={review.issues} />
          </Section>

          <Section title="So sánh bản gốc / bản sửa">
            <QuestionDiffView
              diff={review.diff}
              original={review.original}
              revised={review.revised}
            />
          </Section>
        </>
      )}

      <ReviewActionBar review={review} onResolved={onResolved} />
    </div>
  )
}

export function PoolReviewDetailSheet({
  reviewId,
  onOpenChange,
}: {
  reviewId: number | undefined
  onOpenChange: (open: boolean) => void
}) {
  const { review, isPending, isError, error, refetch } = usePoolReview(reviewId)

  return (
    <Sheet open={reviewId !== undefined} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl!">
        <SheetHeader>
          <SheetTitle>
            {reviewId === undefined ? "Chi tiết review" : `Review #${reviewId}`}
          </SheetTitle>
          <SheetDescription>
            Kết quả AI rà soát, checklist thay đổi và thao tác duyệt/từ chối.
          </SheetDescription>
        </SheetHeader>

        {isError ? (
          <div className="px-4">
            <QueryError
              title="Không tải được review"
              error={error}
              onRetry={() => void refetch()}
            />
          </div>
        ) : isPending ? (
          <div className="space-y-3 px-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : review ? (
          <DetailBody review={review} onResolved={() => onOpenChange(false)} />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
