import { Link } from "@tanstack/react-router"
import { IconBook } from "@tabler/icons-react"

import {
  DetailDialog,
  DetailDialogBody,
  DetailDialogContent,
  DetailDialogDescription,
  DetailDialogFooter,
  DetailDialogHeader,
  DetailDialogTitle,
} from "@/components/common/detail-dialog.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getEngLevelBadgeClass } from "@/features/quiz/constants.ts"
import { getReadingTypeLabel } from "@/features/readings/constants.ts"
import { formatDateTime, formatNumber } from "@/lib/format.ts"

import type { ReadingQuestion } from "../types.ts"
import { ReadingQuestionCard } from "./reading-question-card.tsx"

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm tabular-nums">{value}</dd>
    </div>
  )
}

function ReadingQuestionDetailContent({
  question,
}: {
  question: ReadingQuestion
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={getEngLevelBadgeClass(question.cefrLevel)}
        >
          {question.cefrLevel}
        </Badge>
        <Badge variant="outline">{getReadingTypeLabel(question.type)}</Badge>
        <span className="text-sm text-muted-foreground">
          {question.topicName ?? "Không có chủ đề"}
        </span>
      </div>

      <ReadingQuestionCard question={question} />

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border p-4 sm:grid-cols-4">
        <MetaRow label="ID" value={String(question.id)} />
        <MetaRow label="Bài đọc" value={`#${question.passageRefId}`} />
        <MetaRow label="Token vào" value={formatNumber(question.tokenIn)} />
        <MetaRow label="Token ra" value={formatNumber(question.tokenOut)} />
        <MetaRow label="Tạo lúc" value={formatDateTime(question.createdAt)} />
        <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-4">
          <dt className="text-xs text-muted-foreground">Model</dt>
          <dd className="font-mono text-sm break-all">{question.model}</dd>
        </div>
      </dl>
    </div>
  )
}

export function ReadingQuestionDetailSheet({
  question,
  onOpenChange,
}: {
  question: ReadingQuestion | undefined
  onOpenChange: (open: boolean) => void
}) {
  return (
    <DetailDialog open={Boolean(question)} onOpenChange={onOpenChange}>
      <DetailDialogContent>
        <DetailDialogHeader>
          <DetailDialogTitle>Chi tiết câu hỏi</DetailDialogTitle>
          <DetailDialogDescription>
            Nội dung và metadata của câu hỏi đang lưu trong kho.
          </DetailDialogDescription>
        </DetailDialogHeader>

        <DetailDialogBody>
          {question ? (
            <ReadingQuestionDetailContent question={question} />
          ) : null}
        </DetailDialogBody>

        {question ? (
          <DetailDialogFooter>
            <Button
              variant="outline"
              render={
                <Link
                  to="/readings"
                  search={{ readingId: question.passageRefId }}
                />
              }
            >
              <IconBook stroke={1.5} data-icon="inline-start" />
              Mở bài đọc
            </Button>
          </DetailDialogFooter>
        ) : null}
      </DetailDialogContent>
    </DetailDialog>
  )
}
