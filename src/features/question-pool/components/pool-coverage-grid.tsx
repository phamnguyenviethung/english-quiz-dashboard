import type { QuizType } from "@/features/quiz/types.ts"

import type { PoolCoverageCell } from "../types.ts"
import { PoolBucketCard } from "./pool-bucket-card.tsx"

export function PoolCoverageGrid({
  cells,
  pending,
  fillingQuizType,
  onFill,
}: {
  cells: PoolCoverageCell[]
  pending: ReadonlySet<QuizType>
  fillingQuizType: QuizType | undefined
  onFill: (quizType: QuizType) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cells.map((cell) => (
        <PoolBucketCard
          key={cell.quizType}
          cell={cell}
          isGenerating={pending.has(cell.quizType)}
          isFilling={fillingQuizType === cell.quizType}
          onFill={() => onFill(cell.quizType)}
        />
      ))}
    </div>
  )
}
