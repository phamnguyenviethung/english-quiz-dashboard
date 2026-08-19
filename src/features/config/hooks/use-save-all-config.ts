import { usePatchEnglishConfigRecords } from "@/apis/english-config/english-config.ts"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import type { ConfigDraft, ConfigRecord } from "../types.ts"
import { fromDraft } from "../utils/config-value-io.ts"
import { useInvalidateConfig } from "./use-invalidate-config.ts"

/**
 * Lưu mọi record đang dirty bằng 1 request. Bắt buộc phải là bulk chứ không PATCH
 * lần lượt: server validate ràng buộc chéo (vd `manualFillMinCount` ≤
 * `manualFillDefaultCount`) trên từng request, nên sửa cả hai cùng lúc sẽ fail ở
 * request đầu dù trạng thái cuối hợp lệ.
 */
export function useSaveAllConfig() {
  const invalidate = useInvalidateConfig()
  const mutation = usePatchEnglishConfigRecords()

  const saveAll = async (
    records: ConfigRecord[],
    drafts: Record<string, ConfigDraft>
  ) => {
    const changes = records.map((record) => ({
      recordKey: record.recordKey,
      value: fromDraft(record, drafts[record.recordKey]),
    }))
    if (changes.length === 0) return true

    try {
      await mutation.mutateAsync({ data: { changes } })
      await invalidate()
      toast.add({
        type: "success",
        title: "Đã lưu cấu hình",
        description: `${changes.length} thay đổi đã được áp dụng.`,
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

  return { saveAll, isSaving: mutation.isPending }
}
