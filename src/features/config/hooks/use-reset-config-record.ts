import { usePostEnglishConfigByRecordKeyReset } from "@/apis/english-config/english-config.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import { useInvalidateConfig } from "./use-invalidate-config.ts"

export function useResetConfigRecord() {
  const invalidate = useInvalidateConfig()
  const mutation = usePostEnglishConfigByRecordKeyReset()

  const resetRecord = async (recordKey: string, label: string) => {
    try {
      await mutation.mutateAsync({ recordKey })
      await invalidate()
      toast.add({
        type: "success",
        title: "Đã đặt lại mặc định",
        description: `"${label}" đã trở về giá trị mặc định.`,
      })
      return true
    } catch (error) {
      toast.add({
        type: "error",
        title: "Không đặt lại được",
        description: getApiErrorMessage(error),
      })
      return false
    }
  }

  return {
    resetRecord,
    pendingRecordKey: mutation.isPending
      ? mutation.variables.recordKey
      : undefined,
  }
}
