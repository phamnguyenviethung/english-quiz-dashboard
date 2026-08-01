import { useCallback, useEffect, useRef, useState } from "react"

import type { QuizType } from "@/features/quiz/types.ts"

import { PENDING_FILL_MAX_MS } from "../constants.ts"

export function usePendingFills() {
  const [pending, setPending] = useState<ReadonlySet<QuizType>>(new Set())
  const timers = useRef(new Map<QuizType, ReturnType<typeof setTimeout>>())

  const clearPending = useCallback((quizType: QuizType) => {
    const timer = timers.current.get(quizType)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(quizType)
    }
    setPending((current) => {
      if (!current.has(quizType)) return current
      const next = new Set(current)
      next.delete(quizType)
      return next
    })
  }, [])

  const markPending = useCallback(
    (quizType: QuizType) => {
      const existing = timers.current.get(quizType)
      if (existing) clearTimeout(existing)

      timers.current.set(
        quizType,
        setTimeout(() => clearPending(quizType), PENDING_FILL_MAX_MS)
      )
      setPending((current) => new Set(current).add(quizType))
    },
    [clearPending]
  )

  useEffect(() => {
    const active = timers.current
    return () => {
      for (const timer of active.values()) clearTimeout(timer)
      active.clear()
    }
  }, [])

  return { pending, markPending, clearPending }
}
