import { useMemo } from "react"

import { useAiModels } from "@/features/ai-models/hooks/use-ai-models.ts"
import type { AiModel } from "@/features/ai-models/types.ts"

/**
 * Model dùng được cho refill thủ công. Lọc đúng điều kiện backend chấp nhận
 * (`isActive && manualEnabled`) — gửi model ngoài tập này sẽ bị API trả 400.
 */
export function useManualRefillModels() {
  const { models, isPending, isError, error, refetch } = useAiModels()

  const usableModels = useMemo<AiModel[]>(
    () => models.filter((model) => model.isActive && model.manualEnabled),
    [models]
  )

  return { models: usableModels, isPending, isError, error, refetch }
}
