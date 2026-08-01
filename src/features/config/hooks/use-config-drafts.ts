import { useState } from "react"

import type { ConfigDraft, ConfigFieldSchema, ConfigRecord } from "../types.ts"
import { isDraftEqual, toDraft } from "../utils/config-value-io.ts"
import { resolveRecordSchema } from "../utils/parse-config-schema.ts"

/**
 * Chỉ record đang sửa mới có entry trong map. Xoá entry sau khi lưu thành công
 * để giá trị hiển thị đồng bộ lại theo dữ liệu server.
 */
export function useConfigDrafts(records: ConfigRecord[]) {
  const [drafts, setDrafts] = useState<Record<string, ConfigDraft>>({})

  const getDraft = (
    record: ConfigRecord,
    schema: ConfigFieldSchema
  ): ConfigDraft => drafts[record.recordKey] ?? toDraft(record, schema)

  const clearDraft = (recordKey: string) => {
    setDrafts(({ [recordKey]: _removed, ...rest }) => rest)
  }

  const dirtyKeys = records
    .filter(
      (record) =>
        Object.hasOwn(drafts, record.recordKey) &&
        !isDraftEqual(
          drafts[record.recordKey],
          toDraft(record, resolveRecordSchema(record))
        )
    )
    .map((record) => record.recordKey)

  return {
    getDraft,
    setDraft: (recordKey: string, draft: ConfigDraft) =>
      setDrafts((prev) => ({ ...prev, [recordKey]: draft })),
    clearDraft,
    clearAll: () => setDrafts({}),
    dirtyKeys,
  }
}
