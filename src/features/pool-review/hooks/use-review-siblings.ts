import { useNavigate } from "@tanstack/react-router"

import { useGetAdminPoolReviews } from "@/apis/admin-pool-review/admin-pool-review.ts"

import { poolReviewListParams } from "../search.ts"
import type { PoolReviewListSearch } from "../search.ts"

/**
 * Prev/next giữa các review theo đúng thứ tự danh sách đang lọc. Dùng lại cache list
 * mà route đã prefetch. Khi hết trang, nhảy sang trang kế của danh sách (một chạm để
 * chọn tiếp) thay vì cố tải chéo trang.
 */
export function useReviewSiblings({
  reviewId,
  listSearch,
}: {
  reviewId: number
  listSearch: PoolReviewListSearch
}) {
  const navigate = useNavigate()
  const params = poolReviewListParams(listSearch)
  const query = useGetAdminPoolReviews(params, {
    query: { staleTime: 10_000 },
  })

  const data = query.data?.data
  const items = data?.items ?? []
  const index = items.findIndex((item) => item.id === reviewId)
  const page = data?.page ?? listSearch.page ?? 1
  const pageSize = data?.pageSize ?? items.length
  const totalPages = data?.totalPages ?? 1

  const prevId = index > 0 ? items[index - 1]?.id : undefined
  const nextId =
    index >= 0 && index < items.length - 1 ? items[index + 1]?.id : undefined

  const canPrevPage = page > 1
  const canNextPage = page < totalPages

  const positionInList =
    index >= 0 ? (page - 1) * pageSize + index + 1 : undefined

  const gotoReview = (id: number) =>
    void navigate({
      to: "/pool-review/$reviewId",
      params: { reviewId: String(id) },
      search: listSearch,
    })

  const gotoListPage = (nextPage: number) =>
    void navigate({
      to: "/pool-review",
      search: { ...listSearch, page: nextPage > 1 ? nextPage : undefined },
    })

  return {
    index,
    positionInList,
    total: data?.total,
    hasPrev: prevId !== undefined || canPrevPage,
    hasNext: nextId !== undefined || canNextPage,
    gotoPrev: () => {
      if (prevId !== undefined) gotoReview(prevId)
      else if (canPrevPage) gotoListPage(page - 1)
    },
    gotoNext: () => {
      if (nextId !== undefined) gotoReview(nextId)
      else if (canNextPage) gotoListPage(page + 1)
    },
  }
}
