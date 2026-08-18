import { usePostAdminReadingQuestionsGenerate } from "@/apis/admin-reading-questions/admin-reading-questions.ts"

/** Sinh thử trọn bộ câu hỏi cho 1 bài. Kết quả KHÔNG được lưu vào kho. */
export function useGenerateReadingQuestions() {
  const mutation = usePostAdminReadingQuestionsGenerate()

  return {
    generate: (passageId: number, model?: string) =>
      mutation.mutateAsync({
        data: { passageId, ...(model ? { model } : {}) },
      }),
    questions: mutation.data?.data.questions,
    usage: mutation.data?.data.usage,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}
