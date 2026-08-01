import { usePatchEnglishConfigByRecordKey } from "@/apis/english-config/english-config.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import { useInvalidateConfig } from "./use-invalidate-config.ts"

export function useUpdateConfigRecord() {
  const invalidate = useInvalidateConfig()
  const mutation = usePatchEnglishConfigByRecordKey()

  const updateRecord = async (
    recordKey: string,
    value: unknown,
    label: string
  ) => {
    try {
      await mutation.mutateAsync({ recordKey, data: { value } })
      await invalidate()
      toast.add({
        type: "success",
        title: "Đã lưu cấu hình",
        description: `"${label}" đã được cập nhật.`,
      })
      return true
    } catch (error) {
      toast.add({
        type: "error",
        title: "Không lưu được cấu hình",
        description: getApiErrorMessage(error),
      })
      return false
    }
  }

  return {
    updateRecord,
    pendingRecordKey: mutation.isPending
      ? mutation.variables.recordKey
      : undefined,
  }
}
