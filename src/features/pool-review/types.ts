import type {
  GetAdminPoolReviews200DataItemsItem,
  GetAdminPoolReviewsById200Data,
  GetAdminPoolReviewsById200DataDiffItem,
  GetAdminPoolReviewsParams,
  GetAdminPoolReviewsSort,
  PostAdminPoolReviewsBodyOne,
  PostAdminPoolReviewsByIdApproveBodyOne,
  PostAdminPoolReviewsByIdRejectBodyOne,
} from "@/apis/model"

export type PoolReview = GetAdminPoolReviews200DataItemsItem
export type PoolReviewDetail = GetAdminPoolReviewsById200Data
export type PoolReviewDiffItem = GetAdminPoolReviewsById200DataDiffItem
export type PoolReviewsSort = GetAdminPoolReviewsSort
export type PoolReviewsParams = GetAdminPoolReviewsParams
export type EnqueueReviewsBody = PostAdminPoolReviewsBodyOne
export type ApproveReviewBody = PostAdminPoolReviewsByIdApproveBodyOne
export type RejectReviewBody = PostAdminPoolReviewsByIdRejectBodyOne
