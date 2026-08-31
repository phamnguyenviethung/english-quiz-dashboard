import { ENG_LEVELS, QUIZ_TYPES } from "@/features/quiz/constants.ts"
import type { EngLevel, QuizType } from "@/features/quiz/types.ts"

import {
  DEFAULT_POOL_REVIEW_SORT,
  PAGE_SIZE_OPTIONS,
  POOL_REVIEW_SORTS,
  REVIEWS_PAGE_SIZE,
  REVIEW_STATUS_META,
  REVIEW_VERDICT_META,
} from "./constants.ts"
import { buildPoolReviewsParams } from "./hooks/use-pool-reviews.ts"
import type { PoolReviewsParams, PoolReviewsSort } from "./types.ts"

export type ReviewStatus = NonNullable<PoolReviewsParams["status"]>
export type ReviewVerdict = NonNullable<PoolReviewsParams["verdict"]>

/** Bộ lọc danh sách review — dùng chung cho route list và route chi tiết (để prev/next). */
export interface PoolReviewListSearch {
  status?: ReviewStatus
  verdict?: ReviewVerdict
  quizType?: QuizType
  engLevel?: EngLevel
  poolQuestionRefId?: number
  q?: string
  sort?: PoolReviewsSort
  page?: number
  pageSize?: number
}

export function parsePositiveInt(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export function parsePoolReviewListSearch(
  search: Record<string, unknown>
): PoolReviewListSearch {
  const status = Object.hasOwn(REVIEW_STATUS_META, String(search.status))
    ? (search.status as ReviewStatus)
    : undefined
  const verdict = Object.hasOwn(REVIEW_VERDICT_META, String(search.verdict))
    ? (search.verdict as ReviewVerdict)
    : undefined
  const quizType = QUIZ_TYPES.find((type) => type === search.quizType)
  const engLevel = ENG_LEVELS.find((level) => level === search.engLevel)
  const poolQuestionRefId = parsePositiveInt(search.poolQuestionRefId)
  const q =
    typeof search.q === "string" && search.q.trim()
      ? search.q.trim().slice(0, 100)
      : undefined
  const sort = POOL_REVIEW_SORTS.find((value) => value === search.sort)
  const parsedPage = Number(search.page)
  const page =
    Number.isInteger(parsedPage) && parsedPage > 1 ? parsedPage : undefined
  const parsedPageSize = Number(search.pageSize)
  const pageSize = PAGE_SIZE_OPTIONS.find(
    (size) => size === parsedPageSize && size !== REVIEWS_PAGE_SIZE
  )

  return {
    ...(status ? { status } : {}),
    ...(verdict ? { verdict } : {}),
    ...(quizType ? { quizType } : {}),
    ...(engLevel ? { engLevel } : {}),
    ...(poolQuestionRefId ? { poolQuestionRefId } : {}),
    ...(q ? { q } : {}),
    ...(sort ? { sort } : {}),
    ...(page ? { page } : {}),
    ...(pageSize ? { pageSize } : {}),
  }
}

/** Query params gửi backend, với default khớp component (nếu không SSR prefetch lệch cache). */
export function poolReviewListParams(
  search: PoolReviewListSearch
): PoolReviewsParams {
  return buildPoolReviewsParams({
    status: search.status,
    verdict: search.verdict,
    quizType: search.quizType,
    engLevel: search.engLevel,
    topicId: undefined,
    poolQuestionRefId: search.poolQuestionRefId,
    q: search.q,
    sort: search.sort ?? DEFAULT_POOL_REVIEW_SORT,
    page: search.page ?? 1,
    pageSize: search.pageSize ?? REVIEWS_PAGE_SIZE,
  })
}
