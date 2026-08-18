import { useGetAdminReadingQuestionsModels } from "@/apis/admin-reading-questions/admin-reading-questions.ts"

/** Model đang có câu hỏi trong kho — đổ dropdown filter. */
export function useReadingQuestionStoreModels() {
  const query = useGetAdminReadingQuestionsModels()
  return {
    models: query.data?.data,
    isPending: query.isPending,
  }
}
