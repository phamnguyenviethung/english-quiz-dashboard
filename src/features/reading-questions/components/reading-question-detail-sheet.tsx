import { Link } from "@tanstack/react-router"
import { IconBook } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { getEngLevelBadgeClass } from "@/features/quiz/constants.ts"
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
    <div className="space-y-6 px-4 pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={getEngLevelBadgeClass(question.cefrLevel)}
        >
          {question.cefrLevel}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {question.topicName ?? "Không có chủ đề"}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto"
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
      </div>

      <ReadingQuestionCard question={question} />

      <dl className="grid grid-cols-2 gap-4 rounded-2xl border p-4 sm:grid-cols-4">
        <MetaRow label="ID" value={String(question.id)} />
        <MetaRow label="Bài đọc" value={`#${question.passageRefId}`} />
        <MetaRow label="Token vào" value={formatNumber(question.tokenIn)} />
        <MetaRow label="Token ra" value={formatNumber(question.tokenOut)} />
        <MetaRow label="Tạo lúc" value={formatDateTime(question.createdAt)} />
        <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-3">
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
    <Sheet open={Boolean(question)} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl!">
        <SheetHeader>
          <SheetTitle>Chi tiết câu hỏi</SheetTitle>
          <SheetDescription>
            Nội dung và metadata của câu hỏi đang lưu trong kho.
          </SheetDescription>
        </SheetHeader>

        {question ? <ReadingQuestionDetailContent question={question} /> : null}
      </SheetContent>
    </Sheet>
  )
}
