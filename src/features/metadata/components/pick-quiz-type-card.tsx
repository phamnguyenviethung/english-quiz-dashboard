import { IconArrowsShuffle } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { getQuizTypeLabel } from "@/features/quiz/constants.ts"

import { usePickQuizType } from "../hooks/use-pick-quiz-type.ts"

export function PickQuizTypeCard() {
  const { quizType, isFetching, isError, error, pick } = usePickQuizType()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconArrowsShuffle
            className="size-4 text-muted-foreground"
            stroke={1.5}
          />
          <CardTitle>Bốc loại câu hỏi</CardTitle>
        </div>
        <CardDescription>
          Gọi thuật toán phân bổ của bot để xem loại câu hỏi được chọn tiếp
          theo.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <Button
          variant="secondary"
          onClick={() => void pick()}
          disabled={isFetching}
        >
          {isFetching ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <IconArrowsShuffle stroke={1.5} data-icon="inline-start" />
          )}
          Bốc ngẫu nhiên
        </Button>

        {isError ? (
          <QueryError
            title="Không bốc được loại câu hỏi"
            error={error}
            onRetry={() => void pick()}
          />
        ) : quizType ? (
          <div>
            <Badge variant="secondary">{getQuizTypeLabel(quizType)}</Badge>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
