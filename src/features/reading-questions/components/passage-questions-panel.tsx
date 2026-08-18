import { useState } from "react"
import { IconHelpCircle, IconSparkles } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import { useReadingQuestions } from "../hooks/use-reading-questions.ts"
import { GenerateQuestionsDialog } from "./generate-questions-dialog.tsx"
import { ReadingQuestionCard } from "./reading-question-card.tsx"

/** Câu hỏi của đúng 1 bài đọc — dùng trong sheet chi tiết bài. */
export function PassageQuestionsPanel({
  passageId,
  passageTitle,
  cefrLevel,
}: {
  passageId: number
  passageTitle: string
  cefrLevel: string
}) {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)

  const { items, isPending, isError, error, refetch } = useReadingQuestions({
    passageId,
    pageSize: 20,
    sort: "id_asc",
  })

  const generateButton = (
    <Button variant="outline" onClick={() => setIsGenerateOpen(true)}>
      <IconSparkles stroke={1.5} data-icon="inline-start" />
      Sinh thử câu hỏi
    </Button>
  )

  return (
    <div className="space-y-4">
      {isPending ? (
        <div className="space-y-3 rounded-2xl border p-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError ? (
        <QueryError error={error} onRetry={() => void refetch()} />
      ) : items && items.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {items.length} câu hỏi
            </span>
            <div className="ml-auto">{generateButton}</div>
          </div>

          <div className="space-y-6">
            {items.map((question, index) => (
              <ReadingQuestionCard
                key={question.id}
                question={question}
                index={index}
                className="border-t pt-6 first:border-t-0 first:pt-0"
              />
            ))}
          </div>
        </>
      ) : (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconHelpCircle stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Bài này chưa có câu hỏi</EmptyTitle>
            <EmptyDescription>
              Cron sẽ tự sinh ở lần chạy tới. Muốn xem thử ngay thì dùng nút bên
              dưới, hoặc sinh và lưu hàng loạt ở màn Sinh hàng loạt.
            </EmptyDescription>
          </EmptyHeader>
          {generateButton}
        </Empty>
      )}

      <GenerateQuestionsDialog
        passageId={passageId}
        passageTitle={passageTitle}
        cefrLevel={cefrLevel}
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
      />
    </div>
  )
}
