import { useMemo } from "react"

import { useGetAdminPoolBuckets } from "@/apis/admin-pool/admin-pool.ts"
import { useGetAdminReadingsBuckets } from "@/apis/admin-readings/admin-readings.ts"
import { useConfigSnapshot } from "@/features/config/hooks/use-config-snapshot.ts"
import { QUIZ_TYPES } from "@/features/quiz/constants.ts"
import type { QuizType } from "@/features/quiz/types.ts"
import { useTopics } from "@/features/topics/hooks/use-topics.ts"

import { buildTopicCoverage, getFullBucketRatio } from "../utils/coverage.ts"

export interface BeginnerQuizTypeState {
  quizType: QuizType
  enabled: boolean
  /** Loại đang tắt ở quiz_distribution — kill switch chung, beginner cũng không sinh được. */
  globallyDisabled: boolean
}

export function useBeginnerHub() {
  const topicsQuery = useTopics()
  const configQuery = useConfigSnapshot()
  const poolBucketsQuery = useGetAdminPoolBuckets({
    audience: "beginner",
    scope: "all",
  })
  const readingBucketsQuery = useGetAdminReadingsBuckets({
    audience: "beginner",
    scope: "all",
  })

  const snapshot = configQuery.snapshot
  const poolBuckets = poolBucketsQuery.data?.data.buckets ?? []
  const readingBuckets = readingBucketsQuery.data?.data.buckets ?? []
  const poolMaxPerBucket = snapshot?.question_pool.maxPerBucket ?? 0
  const readingMaxPerBucket = snapshot?.reading_passage.maxPerBucket ?? 0

  const beginnerTopics = useMemo(
    () => topicsQuery.topics.filter((topic) => topic.forBeginner),
    [topicsQuery.topics]
  )

  const quizTypes = useMemo<BeginnerQuizTypeState[]>(() => {
    const beginnerItems = new Map(
      (snapshot?.beginner_quiz_types ?? []).map((item) => [
        item.quizType,
        item.enabled,
      ])
    )
    const globallyEnabled = new Set(
      (snapshot?.quiz_distribution ?? [])
        .filter((item) => item.enabled && item.weight > 0)
        .map((item) => item.quizType)
    )
    return QUIZ_TYPES.map((quizType) => ({
      quizType,
      enabled: beginnerItems.get(quizType) ?? false,
      globallyDisabled: !globallyEnabled.has(quizType),
    }))
  }, [snapshot])

  const coverage = useMemo(
    () =>
      buildTopicCoverage({
        topicIds: beginnerTopics.map((topic) => topic.id),
        poolBuckets,
        readingBuckets,
        poolMaxPerBucket,
        readingMaxPerBucket,
      }),
    [
      beginnerTopics,
      poolBuckets,
      readingBuckets,
      poolMaxPerBucket,
      readingMaxPerBucket,
    ]
  )

  return {
    topics: topicsQuery.topics,
    beginnerTopics,
    quizTypes,
    coverage,
    poolFullRatio: getFullBucketRatio(poolBuckets, poolMaxPerBucket),
    readingFullRatio: getFullBucketRatio(readingBuckets, readingMaxPerBucket),
    poolBucketCount: poolBuckets.length,
    readingBucketCount: readingBuckets.length,
    isPending:
      topicsQuery.isPending ||
      configQuery.isPending ||
      poolBucketsQuery.isPending ||
      readingBucketsQuery.isPending,
    isCoveragePending:
      poolBucketsQuery.isPending || readingBucketsQuery.isPending,
    isError:
      topicsQuery.isError ||
      configQuery.isError ||
      poolBucketsQuery.isError ||
      readingBucketsQuery.isError,
    error:
      topicsQuery.error ??
      configQuery.error ??
      poolBucketsQuery.error ??
      readingBucketsQuery.error,
    refetch: () =>
      Promise.all([
        topicsQuery.refetch(),
        configQuery.refetch(),
        poolBucketsQuery.refetch(),
        readingBucketsQuery.refetch(),
      ]),
    isRefetching:
      topicsQuery.isRefetching ||
      poolBucketsQuery.isRefetching ||
      readingBucketsQuery.isRefetching,
  }
}
