import type { CronRunAttempt } from "../types.ts"

export function groupAttemptsByBucket(
  attempts: CronRunAttempt[]
): Map<number, CronRunAttempt[]> {
  const grouped = new Map<number, CronRunAttempt[]>()

  for (const attempt of attempts) {
    const bucket = grouped.get(attempt.bucketRefId)
    if (bucket) bucket.push(attempt)
    else grouped.set(attempt.bucketRefId, [attempt])
  }

  for (const list of grouped.values()) {
    list.sort((a, b) => a.attemptOrder - b.attemptOrder)
  }

  return grouped
}
