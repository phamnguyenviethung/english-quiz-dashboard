import { useEffect } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"

import {
  getGetAdminPoolReviewsByIdQueryOptions,
  getGetAdminPoolReviewsQueryOptions,
} from "@/apis/admin-pool-review/admin-pool-review.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getEngLevelBadgeClass,
  getQuizTypeLabel,
} from "@/features/quiz/constants.ts"
import { formatDateTime, formatNumber } from "@/lib/format.ts"

import { QuestionDiffView } from "@/features/pool-review/components/question-diff-view.tsx"
import { ReviewActions } from "@/features/pool-review/components/review-actions.tsx"
import { ReviewChecklist } from "@/features/pool-review/components/review-checklist.tsx"
import { ReviewEditJsonPanel } from "@/features/pool-review/components/review-edit-json-panel.tsx"
import {
  ReviewStatusBadge,
  ReviewVerdictBadge,
} from "@/features/pool-review/components/review-badges.tsx"
import { getReviewSeverityMeta } from "@/features/pool-review/constants.ts"
import { usePoolReview } from "@/features/pool-review/hooks/use-pool-review.ts"
import { useReviewSiblings } from "@/features/pool-review/hooks/use-review-siblings.ts"
import {
  parsePoolReviewListSearch,
  poolReviewListParams,
} from "@/features/pool-review/search.ts"
import type { PoolReviewListSearch } from "@/features/pool-review/search.ts"
import type { PoolReviewDetail } from "@/features/pool-review/types.ts"

const DETAIL_TABS = ["diff", "edit"] as const
type DetailTab = (typeof DETAIL_TABS)[number]
type ActiveTab = "overview" | DetailTab

interface ReviewDetailSearch extends PoolReviewListSearch {
  tab?: DetailTab
}

export const Route = createFileRoute("/_dashboard/pool-review/$reviewId")({
  validateSearch: (search: Record<string, unknown>): ReviewDetailSearch => {
    const list = parsePoolReviewListSearch(search)
    const tab = DETAIL_TABS.find((value) => value === search.tab)
    return { ...list, ...(tab ? { tab } : {}) }
  },
  loaderDeps: ({ search }) => ({
    listParams: poolReviewListParams(search),
  }),
  loader: ({ context, params, deps }) => {
    void context.queryClient.prefetchQuery(
      getGetAdminPoolReviewsByIdQueryOptions(params.reviewId)
    )
    void context.queryClient.prefetchQuery(
      getGetAdminPoolReviewsQueryOptions(deps.listParams)
    )
  },
  component: PoolReviewDetailPage,
})

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
          <li key={index} className="rounded-2xl border p-3 text-[0.95rem]">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs">{issue.field}</span>
              <Badge variant="outline" className={severity.className}>
                {severity.label}
              </Badge>
            </div>
            <p className="wrap-break-word">{issue.problem}</p>
            {issue.fix ? (
              <p className="mt-1 wrap-break-word text-muted-foreground">
                <span className="font-medium">Đã sửa:</span> {issue.fix}
              </p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

function MetaGrid({ review }: { review: PoolReviewDetail }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border p-4 sm:grid-cols-4">
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
        <dt className="text-xs text-muted-foreground">Token vào / ra</dt>
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
  )
}

function OverviewTab({ review }: { review: PoolReviewDetail }) {
  if (review.status === "failed") {
    return (
      <div className="space-y-4">
        <MetaGrid review={review} />
        <Alert variant="destructive">
          <IconAlertTriangle stroke={1.5} />
          <AlertTitle>Review thất bại</AlertTitle>
          <AlertDescription>
            {review.errorMessage ?? "Không rõ nguyên nhân."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <MetaGrid review={review} />

      {review.adminNote ? (
        <Section title="Ghi chú của admin">
          <p className="rounded-2xl border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
            {review.adminNote}
          </p>
        </Section>
      ) : null}

      {review.summary ? (
        <Section title="Tóm tắt">
          <p className="text-sm wrap-break-word whitespace-pre-wrap">
            {review.summary}
          </p>
        </Section>
      ) : null}

      <Section title="Kết quả rà soát">
        <ReviewChecklist checklist={review.checklist} />
      </Section>

      <Section title="Vấn đề phát hiện">
        <IssuesList issues={review.issues} />
      </Section>
    </div>
  )
}

function PoolReviewDetailPage() {
  const { reviewId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const id = Number(reviewId)
  const { tab, ...listSearch } = search
  const { review, isPending, isError, error, refetch } = usePoolReview(id)
  const siblings = useReviewSiblings({ reviewId: id, listSearch })

  const goList = () => void navigate({ to: "/pool-review", search: listSearch })

  // j / k: chuyển review kế / trước (bỏ qua khi đang gõ trong ô nhập).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = document.activeElement
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable)
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === "j") siblings.gotoNext()
      else if (event.key === "k") siblings.gotoPrev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [siblings])

  const headerActions = (
    <div className="flex items-center gap-1">
      <Button variant="ghost" onClick={goList}>
        <IconArrowLeft stroke={1.5} data-icon="inline-start" />
        <span className="hidden sm:inline">Danh sách</span>
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Review trước (k)"
        disabled={!siblings.hasPrev}
        onClick={siblings.gotoPrev}
      >
        <IconChevronLeft stroke={1.5} />
      </Button>
      <span className="min-w-14 text-center text-sm text-muted-foreground tabular-nums">
        {siblings.positionInList ?? "–"}
        {siblings.total === undefined
          ? ""
          : ` / ${formatNumber(siblings.total)}`}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Review kế (j)"
        disabled={!siblings.hasNext}
        onClick={siblings.gotoNext}
      >
        <IconChevronRight stroke={1.5} />
      </Button>
    </div>
  )

  if (isError) {
    return (
      <>
        <PageHeader title={`Review #${reviewId}`} actions={headerActions} />
        <QueryError
          title="Không tải được review"
          error={error}
          onRetry={() => void refetch()}
        />
      </>
    )
  }

  if (isPending || !review) {
    return (
      <>
        <PageHeader title={`Review #${reviewId}`} actions={headerActions} />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </>
    )
  }

  const isPendingReview = review.status === "pending"
  const activeTab: ActiveTab =
    tab === "edit" && !isPendingReview ? "overview" : (tab ?? "overview")

  const setTab = (value: string) =>
    void navigate({
      search: (prev) => ({
        ...prev,
        tab: value === "overview" ? undefined : (value as DetailTab),
      }),
      replace: true,
    })

  return (
    <>
      <PageHeader
        title={`Review #${review.id}`}
        description={`Câu #${review.poolQuestionRefId} · ${getQuizTypeLabel(
          review.quizType
        )} · ${review.engLevel} · ${review.topicName ?? "Không chủ đề"}`}
        actions={headerActions}
      />

      <div className="flex flex-wrap items-center gap-2">
        <ReviewStatusBadge status={review.status} />
        <ReviewVerdictBadge verdict={review.verdict} />
        <Badge
          variant="outline"
          className={getEngLevelBadgeClass(review.engLevel)}
        >
          {review.engLevel}
        </Badge>
        {review.score !== null ? (
          <span className="text-sm text-muted-foreground tabular-nums">
            {review.score}/100
          </span>
        ) : null}
      </div>

      {review.checklist?.formatValid === false ? (
        <Alert variant="destructive">
          <IconAlertTriangle stroke={1.5} />
          <AlertTitle>Bản AI sửa sai schema</AlertTitle>
          <AlertDescription>
            Không duyệt trực tiếp được. Mở tab “Sửa tay” để chỉnh JSON cho đúng
            schema <code>{review.quizType}</code> rồi duyệt.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-6">
        <div className="min-w-0 space-y-4">
          <Tabs value={activeTab} onValueChange={setTab}>
            <TabsList className="w-full *:flex-1 sm:w-auto sm:*:flex-none">
              <TabsTrigger value="overview">Đánh giá</TabsTrigger>
              <TabsTrigger value="diff">So sánh</TabsTrigger>
              {isPendingReview ? (
                <TabsTrigger value="edit">Sửa tay</TabsTrigger>
              ) : null}
            </TabsList>

            <TabsContent value="overview" className="pt-4">
              <OverviewTab review={review} />
            </TabsContent>
            <TabsContent value="diff" className="pt-4">
              <QuestionDiffView
                diff={review.diff}
                original={review.original}
                revised={review.revised}
              />
            </TabsContent>
            {isPendingReview ? (
              <TabsContent value="edit" className="pt-4">
                <ReviewEditJsonPanel review={review} onApproved={goList} />
              </TabsContent>
            ) : null}
          </Tabs>

          {/* Thanh hành động đáy — mobile / tablet */}
          <div className="sticky bottom-0 z-10 -mx-4 -mb-4 flex gap-2 border-t bg-background/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm *:min-h-12 *:flex-1 md:-mx-6 md:-mb-6 md:px-6 lg:hidden">
            <ReviewActions
              review={review}
              siblings={siblings}
              onGoEdit={() => setTab("edit")}
              onDone={goList}
            />
          </div>
        </div>

        {/* Cột hành động dính — desktop */}
        <aside className="hidden lg:sticky lg:top-20 lg:flex lg:h-fit lg:flex-col lg:gap-3 lg:rounded-2xl lg:border lg:p-4 lg:*:w-full">
          <ReviewActions
            review={review}
            siblings={siblings}
            onGoEdit={() => setTab("edit")}
            onDone={goList}
          />
        </aside>
      </div>
    </>
  )
}
