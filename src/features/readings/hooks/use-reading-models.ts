import { useMemo } from "react"

import { useGetAdminReadingsModels } from "@/apis/admin-readings/admin-readings.ts"
import { useAiModels } from "@/features/ai-models/hooks/use-ai-models.ts"
import type { AiModel } from "@/features/ai-models/types.ts"

import type { ReadingModelStat } from "../types.ts"

const EMPTY_STATS: ReadingModelStat[] = []

/** Model đang có bài trong kho — dùng đổ dropdown filter, không phải để chọn khi sinh. */
export function useReadingStoreModels() {
  const query = useGetAdminReadingsModels()

  return {
    models: query.data?.data ?? EMPTY_STATS,
    isPending: query.isPending,
    isError: query.isError,
  }
}

/**
 * Model dùng được để SINH reading. Lọc đúng điều kiện backend chấp nhận
 * (`isActive && readingEnabled`) — gửi model ngoài tập này sẽ bị API trả 400.
 */
export function useReadingGenerationModels() {
  const { models, isPending, isError, error, refetch } = useAiModels()

  const usableModels = useMemo<AiModel[]>(
    () => models.filter((model) => model.isActive && model.readingEnabled),
    [models]
  )

  return { models: usableModels, isPending, isError, error, refetch }
}
