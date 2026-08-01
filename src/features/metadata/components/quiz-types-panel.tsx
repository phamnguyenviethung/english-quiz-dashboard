import { IconAlertTriangle, IconListDetails } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { QUIZ_TYPE_META, getQuizTypeLabel } from "@/features/quiz/constants.ts"
import type { QuizType } from "@/features/quiz/types.ts"

import { QUIZ_TYPE_SOURCE_FILE } from "../constants.ts"
import { useQuizTypesDiff } from "../hooks/use-quiz-types-diff.ts"

function QuizTypeBadge({ quizType }: { quizType: string }) {
  const meta = Object.hasOwn(QUIZ_TYPE_META, quizType)
    ? QUIZ_TYPE_META[quizType as QuizType]
    : undefined
  const TypeIcon = meta?.icon

  return (
    <Badge variant={meta ? "secondary" : "outline"}>
      {TypeIcon ? <TypeIcon className="size-3.5" stroke={1.5} /> : null}
      {getQuizTypeLabel(quizType)}
    </Badge>
  )
}

export function QuizTypesPanel() {
  const { quizTypes, diff, isPending, isError, error, refetch } =
    useQuizTypesDiff()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconListDetails
            className="size-4 text-muted-foreground"
            stroke={1.5}
          />
          <CardTitle>Loại câu hỏi</CardTitle>
        </div>
        <CardDescription>
          Danh sách quizType API đang hỗ trợ, đối chiếu với hằng phía dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {isError ? (
          <QueryError
            title="Không tải được danh sách loại câu hỏi"
            error={error}
            onRetry={() => void refetch()}
          />
        ) : isPending ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }, (_item, index) => (
              <Skeleton key={index} className="h-6 w-24 rounded-3xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {quizTypes.map((quizType) => (
                <QuizTypeBadge key={quizType} quizType={quizType} />
              ))}
            </div>

            {diff.inSync ? (
              <p className="text-xs text-muted-foreground">
                Khớp với {QUIZ_TYPE_SOURCE_FILE}.
              </p>
            ) : (
              <Alert>
                <IconAlertTriangle stroke={1.5} />
                <AlertTitle>Danh sách lệch với dashboard</AlertTitle>
                <AlertDescription className="space-y-1">
                  {diff.missingLocally.length > 0 ? (
                    <p>
                      API có thêm: {diff.missingLocally.join(", ")}. Cần bổ sung
                      nhãn và icon trong {QUIZ_TYPE_SOURCE_FILE}.
                    </p>
                  ) : null}
                  {diff.missingRemotely.length > 0 ? (
                    <p>
                      Dashboard còn khai báo nhưng API không trả về:{" "}
                      {diff.missingRemotely.join(", ")}.
                    </p>
                  ) : null}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
