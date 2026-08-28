import { Link } from "@tanstack/react-router"
import { IconSparkles } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SendReviewDialog } from "@/features/pool-review/components/send-review-dialog.tsx"
import {
  formatOptionCountLabel,
  getEngLevelBadgeClass,
  getQuizTypeMeta,
} from "@/features/quiz/constants.ts"
import { formatDateTime, formatNumber } from "@/lib/format.ts"

import { NO_TOPIC_LABEL } from "../constants.ts"
import type { PoolQuestion } from "../types.ts"
import { parseQuestionData } from "../utils/question-data.ts"
import { PoolQuestionBody } from "./pool-question-body.tsx"

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm tabular-nums">{value}</dd>
    </div>
  )
}

function PoolQuestionDetailContent({ question }: { question: PoolQuestion }) {
  const quizTypeMeta = getQuizTypeMeta(question.quizType)
  const QuizTypeIcon = quizTypeMeta.icon

  return (
    <div className="space-y-6 px-4 pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <SendReviewDialog
          poolQuestionIds={[question.id]}
          trigger={
            <Button size="sm" variant="outline">
              <IconSparkles stroke={1.5} data-icon="inline-start" />
              Gửi AI review
            </Button>
          }
        />
        <Button size="sm" variant="ghost" render={<Link to="/pool-review" />}>
          Xem các review
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {QuizTypeIcon ? (
            <QuizTypeIcon
              className="size-3.5"
              stroke={1.5}
              data-icon="inline-start"
            />
          ) : null}
          {quizTypeMeta.label}
        </Badge>
        <Badge
          variant="secondary"
          className={getEngLevelBadgeClass(question.engLevel)}
        >
          {question.engLevel}
        </Badge>
        <Badge variant="outline">
          {formatOptionCountLabel(question.optionCount)}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {question.topicName ?? NO_TOPIC_LABEL}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-2xl border p-4 sm:grid-cols-4">
        <MetaRow label="ID" value={String(question.id)} />
        <MetaRow label="Token vào" value={formatNumber(question.tokenIn)} />
        <MetaRow label="Token ra" value={formatNumber(question.tokenOut)} />
        <MetaRow label="Tạo lúc" value={formatDateTime(question.createdAt)} />
        <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-4">
          <dt className="text-xs text-muted-foreground">Model</dt>
          <dd className="font-mono text-sm break-all">{question.model}</dd>
        </div>
      </dl>

      <PoolQuestionBody parsed={parseQuestionData(question.questionData)} />
    </div>
  )
}

export function PoolQuestionDetailSheet({
  question,
  onOpenChange,
}: {
  question: PoolQuestion | undefined
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={Boolean(question)} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl!">
        <SheetHeader>
          <SheetTitle>Chi tiết câu hỏi</SheetTitle>
          <SheetDescription>
            Nội dung và metadata của câu đang lưu trong pool.
          </SheetDescription>
        </SheetHeader>

        {question ? <PoolQuestionDetailContent question={question} /> : null}
      </SheetContent>
    </Sheet>
  )
}
