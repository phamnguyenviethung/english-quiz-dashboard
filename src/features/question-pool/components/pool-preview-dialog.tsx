import { IconDatabaseOff, IconRefresh } from "@tabler/icons-react"

import { CollapsibleJson } from "@/components/common/json-block.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import {
  QUIZ_TYPE_META,
  formatOptionCountLabel,
} from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"

import { usePoolPreview } from "../hooks/use-pool-preview.ts"

export function PoolPreviewDialog({
  open,
  engLevel,
  topicId,
  onOpenChange,
}: {
  open: boolean
  engLevel: EngLevel
  topicId: number | undefined
  onOpenChange: (open: boolean) => void
}) {
  const {
    question,
    parsed,
    isPending,
    isEmpty,
    isError,
    error,
    refetch,
    isFetching,
  } = usePoolPreview({ engLevel, topicId, enabled: open })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Câu hỏi mẫu</DialogTitle>
          <DialogDescription>
            Một câu ngẫu nhiên trong pool theo cấp độ và chủ đề đang chọn. Câu
            hỏi không bị xoá khỏi pool.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : isEmpty ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconDatabaseOff stroke={1.5} />
              </EmptyMedia>
              <EmptyTitle>Bucket đang trống</EmptyTitle>
              <EmptyDescription>
                Chưa có câu hỏi nào cho cấp độ {engLevel} với chủ đề đang chọn.
                Bấm "Tạo thêm" ở một loại câu hỏi để tạo job.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : isError ? (
          <QueryError
            title="Không lấy được câu hỏi"
            error={error}
            onRetry={() => void refetch()}
          />
        ) : question && parsed ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {QUIZ_TYPE_META[question.quizType].label}
              </Badge>
              <Badge variant="outline">
                {formatOptionCountLabel(question.optionCount)}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {question.model}
              </span>
            </div>

            {parsed.kind === "structured" ? (
              <div className="space-y-4">
                {parsed.question.prompt ? (
                  <p className="text-sm leading-relaxed font-medium">
                    {parsed.question.prompt}
                  </p>
                ) : null}

                {parsed.question.options ? (
                  <ol className="space-y-1.5 text-sm">
                    {parsed.question.options.map((option, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span>{option}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}

                {parsed.question.answer ? (
                  <p className="text-sm text-muted-foreground">
                    Đáp án:{" "}
                    <span className="font-medium text-foreground">
                      {parsed.question.answer}
                    </span>
                  </p>
                ) : null}
              </div>
            ) : null}

            <CollapsibleJson
              label="Xem dữ liệu gốc"
              value={parsed.kind === "structured" ? parsed.raw : parsed.text}
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <IconRefresh stroke={1.5} data-icon="inline-start" />
            Lấy câu khác
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
