import { keepPreviousData } from "@tanstack/react-query"

import { useGetAdminReadings } from "@/apis/admin-readings/admin-readings.ts"
import type { GetAdminReadingsParams } from "@/apis/model"

import { READINGS_PAGE_SIZE } from "../constants.ts"

export interface ReadingsFilterInput {
  q: string | undefined
  cefrLevel: GetAdminReadingsParams["cefrLevel"]
  topicId: number | undefined
  noTopic: boolean
  type: GetAdminReadingsParams["type"]
  model: string | undefined
  isActive: boolean | undefined
  forBeginner?: boolean
  createdFrom: string | undefined
  createdTo: string | undefined
  sort: GetAdminReadingsParams["sort"]
  page: number
  pageSize: number
}

export function buildReadingsParams({
  q,
  cefrLevel,
  topicId,
  noTopic,
  type,
  model,
  isActive,
  forBeginner,
  createdFrom,
  createdTo,
  sort,
  page,
  pageSize,
}: ReadingsFilterInput): GetAdminReadingsParams {
  return {
    ...(q ? { q } : {}),
    ...(cefrLevel ? { cefrLevel } : {}),
    ...(noTopic ? { withoutTopic: true } : topicId ? { topicId } : {}),
    ...(type ? { type } : {}),
    ...(model ? { model } : {}),
    ...(isActive === undefined ? {} : { isActive }),
    ...(forBeginner === undefined ? {} : { forBeginner }),
    ...(createdFrom ? { createdFrom } : {}),
    ...(createdTo ? { createdTo } : {}),
    ...(sort ? { sort } : {}),
    page,
    pageSize,
  }
}

export function useReadings(params: GetAdminReadingsParams) {
  const query = useGetAdminReadings(params, {
    // Giữ trang cũ khi đang fetch trang mới để bảng không nháy skeleton mỗi lần đổi trang.
    query: { placeholderData: keepPreviousData },
  })

  const data = query.data?.data

  return {
    items: data?.items,
    page: data?.page ?? Number(params.page ?? 1),
    pageSize: data?.pageSize ?? READINGS_PAGE_SIZE,
    total: data?.total,
    totalPages: data?.totalPages ?? 1,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
  }
}
