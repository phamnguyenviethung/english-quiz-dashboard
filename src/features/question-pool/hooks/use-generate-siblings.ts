import { useQueryClient } from "@tanstack/react-query"

import { getGetEnglishPoolQuestionsQueryKey } from "@/apis/english-question-pool/english-question-pool.ts"
import { usePostAdminPoolSiblingsById } from "@/apis/admin-pool-sibling/admin-pool-sibling.ts"
import type { PostAdminPoolSiblingsByIdBodyOne } from "@/apis/model"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

/** Body của POST /admin/pool/siblings/:id (orval sinh 3 biến thể giống hệt nhau). */
export type GenerateSiblingsBody = PostAdminPoolSiblingsByIdBodyOne

/**
 * Sinh "câu tương tự" từ một câu pool gốc. Endpoint chạy đồng bộ và ghi thẳng vào pool,
 * nên onSuccess chỉ cần invalidate danh sách + báo kết quả.
 */
export function useGenerateSiblings({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  const mutation = usePostAdminPoolSiblingsById({
    mutation: {
      onSuccess: async (result) => {
        await queryClient.invalidateQueries({
          queryKey: getGetEnglishPoolQuestionsQueryKey(),
        })
        const { inserted, failed, generated } = result.data
        toast.add({
          type: inserted > 0 ? "success" : "error",
          title:
            inserted > 0
              ? `Đã thêm ${inserted} câu tương tự vào pool`
              : "Không tạo được câu tương tự nào",
          description:
            failed > 0
              ? `${failed}/${generated} câu bị loại khi kiểm tra (sai schema / trùng câu gốc / lệch term).`
              : undefined,
        })
        onSuccess?.()
      },
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Không sinh được câu tương tự",
          description: getApiErrorMessage(error),
        })
      },
    },
  })

  return {
    generateSiblings: (id: number, data: GenerateSiblingsBody) =>
      mutation.mutateAsync({ id, data }),
    isPending: mutation.isPending,
  }
}
