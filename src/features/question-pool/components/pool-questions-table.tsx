import { IconArrowDown, IconArrowUp } from "@tabler/icons-react"

import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatModelName,
  getEngLevelBadgeClass,
  getQuizTypeMeta,
} from "@/features/quiz/constants.ts"
import { formatDateTime, formatNumber } from "@/lib/format.ts"

import { NO_TOPIC_LABEL } from "../constants.ts"
import type { PoolQuestion, PoolQuestionsSort } from "../types.ts"

const COLUMN_COUNT = 7

export function PoolQuestionsTable({
  questions,
  isPending,
  sort,
  selectedQuestionId,
  onToggleSort,
  onSelect,
}: {
  questions: PoolQuestion[]
  isPending: boolean
  sort: PoolQuestionsSort
  selectedQuestionId: number | undefined
  onToggleSort: () => void
  onSelect: (questionId: number) => void
}) {
  const SortIcon = sort === "id_desc" ? IconArrowDown : IconArrowUp

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">
              <button
                type="button"
                onClick={onToggleSort}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                ID
                <SortIcon className="size-3.5" stroke={1.5} />
              </button>
            </TableHead>
            <TableHead>Loại câu</TableHead>
            <TableHead className="w-20">Cấp độ</TableHead>
            <TableHead>Chủ đề</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Token</TableHead>
            <TableHead>Tạo lúc</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows columns={COLUMN_COUNT} />
          ) : (
            questions.map((question) => {
              const quizTypeMeta = getQuizTypeMeta(question.quizType)
              const QuizTypeIcon = quizTypeMeta.icon
              const model = formatModelName(question.model)

              return (
                <TableRow
                  key={question.id}
                  onClick={() => onSelect(question.id)}
                  data-state={
                    selectedQuestionId === question.id ? "selected" : undefined
                  }
                  className="cursor-pointer"
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    {question.id}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getEngLevelBadgeClass(question.engLevel)}
                    >
                      {question.engLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[24ch] truncate">
                    {question.topicName ?? (
                      <span className="text-muted-foreground">
                        {NO_TOPIC_LABEL}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-xs text-muted-foreground"
                    title={question.model}
                  >
                    {model.provider ? (
                      <span className="text-muted-foreground/70">
                        {model.provider}/
                      </span>
                    ) : null}
                    <span className="font-medium text-foreground">
                      {model.name}
                    </span>
                    {model.suffix ? (
                      <span className="text-muted-foreground/70">
                        :{model.suffix}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(question.tokenIn + question.tokenOut)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {formatDateTime(question.createdAt)}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
