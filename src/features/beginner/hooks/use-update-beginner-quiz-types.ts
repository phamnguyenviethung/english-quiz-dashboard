import { useUpdateConfigRecord } from "@/features/config/hooks/use-update-config-record.ts"
import type { QuizType } from "@/features/quiz/types.ts"

import type { BeginnerQuizTypeState } from "./use-beginner-hub.ts"

export const BEGINNER_QUIZ_TYPES_RECORD_KEY = "beginner_quiz_types.items"

/** Record là cả mảng nên mỗi lần bật/tắt 1 loại phải ghi lại toàn bộ danh sách. */
export function useUpdateBeginnerQuizTypes() {
  const { updateRecord, pendingRecordKey } = useUpdateConfigRecord()

  const setEnabled = (
    current: BeginnerQuizTypeState[],
    quizType: QuizType,
    enabled: boolean
  ) =>
    updateRecord(
      BEGINNER_QUIZ_TYPES_RECORD_KEY,
      current.map((item) => ({
        quizType: item.quizType,
        enabled: item.quizType === quizType ? enabled : item.enabled,
      })),
      "Loại câu hỏi cho người mới"
    )

  return {
    setEnabled,
    isPending: pendingRecordKey === BEGINNER_QUIZ_TYPES_RECORD_KEY,
  }
}
