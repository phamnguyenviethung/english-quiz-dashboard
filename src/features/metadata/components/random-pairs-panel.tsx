import { useState } from "react"
import { IconArrowRight, IconTags } from "@tabler/icons-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

import {
  DEFAULT_PAIR_COUNT,
  PAIR_COUNT_MAX,
  PAIR_COUNT_MIN,
} from "../constants.ts"
import { useRandomTopicPairs } from "../hooks/use-random-topic-pairs.ts"

function clampPairCount(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PAIR_COUNT
  return Math.min(PAIR_COUNT_MAX, Math.max(PAIR_COUNT_MIN, Math.trunc(value)))
}

export function RandomPairsPanel() {
  const [pairCount, setPairCount] = useState(DEFAULT_PAIR_COUNT)
  const { pairs, hasResult, isFetching, isError, error, fetchPairs } =
    useRandomTopicPairs(pairCount)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconTags className="size-4 text-muted-foreground" stroke={1.5} />
          <CardTitle>Cặp chủ đề ngẫu nhiên</CardTitle>
        </div>
        <CardDescription>
          Bot dùng endpoint này để ghép hai chủ đề khi tạo câu hỏi so sánh.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="pair-count">Số cặp</Label>
            <Input
              id="pair-count"
              type="number"
              className="w-24 tabular-nums"
              min={PAIR_COUNT_MIN}
              max={PAIR_COUNT_MAX}
              value={String(pairCount)}
              onChange={(event) =>
                setPairCount(clampPairCount(Number(event.target.value)))
              }
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => void fetchPairs()}
            disabled={isFetching}
          >
            {isFetching ? <Spinner data-icon="inline-start" /> : null}
            Lấy cặp
          </Button>
        </div>

        {isError ? (
          <QueryError
            title="Không lấy được cặp chủ đề"
            error={error}
            onRetry={() => void fetchPairs()}
          />
        ) : hasResult && pairs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            API không trả về cặp nào. Cần ít nhất hai chủ đề đang bật.
          </p>
        ) : (
          <ul className="space-y-2">
            {pairs.map((pair, index) => (
              <li key={index} className="flex items-center gap-2">
                <Badge variant="outline">
                  {pair[0].displayName ?? pair[0].name}
                </Badge>
                <IconArrowRight
                  className="size-3.5 text-muted-foreground"
                  stroke={1.5}
                />
                <Badge variant="outline">
                  {pair[1].displayName ?? pair[1].name}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
