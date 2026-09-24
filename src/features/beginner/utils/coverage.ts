import type { EngLevel } from "@/features/quiz/types.ts"

import { BEGINNER_LEVELS } from "../constants.ts"

export interface CoverageBucket {
  topicId: number | null
  currentCount: number
}

export interface PoolCoverageBucket extends CoverageBucket {
  engLevel: string
}

export interface ReadingCoverageBucket extends CoverageBucket {
  cefrLevel: string
}

export interface CoverageCell {
  current: number
  target: number
}

export interface TopicCoverageRow {
  topicId: number
  pool: Record<EngLevel, CoverageCell>
  reading: Record<EngLevel, CoverageCell>
}

export type CoverageTone = "full" | "partial" | "low" | "empty"

function emptyCells(): Record<EngLevel, CoverageCell> {
  return {
    A1: { current: 0, target: 0 },
    A2: { current: 0, target: 0 },
    B1: { current: 0, target: 0 },
    B2: { current: 0, target: 0 },
  }
}

/** Tồn kho vượt target không bù cho bucket khác — mỗi bucket chỉ tính tối đa bằng target. */
function addBucket(
  cell: CoverageCell,
  currentCount: number,
  maxPerBucket: number
) {
  cell.current += Math.min(Math.max(currentCount, 0), maxPerBucket)
  cell.target += maxPerBucket
}

export function buildTopicCoverage(input: {
  topicIds: number[]
  poolBuckets: PoolCoverageBucket[]
  readingBuckets: ReadingCoverageBucket[]
  poolMaxPerBucket: number
  readingMaxPerBucket: number
}): TopicCoverageRow[] {
  const rows = new Map<number, TopicCoverageRow>(
    input.topicIds.map((topicId) => [
      topicId,
      { topicId, pool: emptyCells(), reading: emptyCells() },
    ])
  )

  for (const bucket of input.poolBuckets) {
    const row = bucket.topicId === null ? undefined : rows.get(bucket.topicId)
    if (!row || !BEGINNER_LEVELS.includes(bucket.engLevel as EngLevel)) continue
    addBucket(
      row.pool[bucket.engLevel as EngLevel],
      bucket.currentCount,
      input.poolMaxPerBucket
    )
  }

  for (const bucket of input.readingBuckets) {
    const row = bucket.topicId === null ? undefined : rows.get(bucket.topicId)
    if (!row || !BEGINNER_LEVELS.includes(bucket.cefrLevel as EngLevel))
      continue
    addBucket(
      row.reading[bucket.cefrLevel as EngLevel],
      bucket.currentCount,
      input.readingMaxPerBucket
    )
  }

  return [...rows.values()]
}

export function getCoverageTone(cell: CoverageCell): CoverageTone {
  if (cell.target === 0) return "empty"
  const ratio = cell.current / cell.target
  if (ratio >= 1) return "full"
  if (ratio >= 0.5) return "partial"
  return "low"
}

/** Tỉ lệ bucket đã đủ tồn kho (0..1). Không có bucket nào → null. */
export function getFullBucketRatio(
  buckets: CoverageBucket[],
  maxPerBucket: number
): number | null {
  if (buckets.length === 0) return null
  const full = buckets.filter(
    (bucket) => bucket.currentCount >= maxPerBucket
  ).length
  return full / buckets.length
}
