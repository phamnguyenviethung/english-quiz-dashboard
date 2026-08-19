import { useCallback, useMemo, useState } from "react"

import type { ConfigDraft, ConfigFieldSchema, ConfigRecord } from "../types.ts"
import { isDraftEqual, toDraft } from "../utils/config-value-io.ts"
import { resolveRecordSchema } from "../utils/parse-config-schema.ts"

/**
 * Chỉ record đang sửa mới có entry trong map. Xoá entry sau khi lưu thành công
 * để giá trị hiển thị đồng bộ lại theo dữ liệu server.
 */
export function useConfigDrafts(records: ConfigRecord[]) {
  const [drafts, setDrafts] = useState<Record<string, ConfigDraft>>({})

  const getDraft = useCallback(
    (record: ConfigRecord, schema: ConfigFieldSchema): ConfigDraft =>
      drafts[record.recordKey] ?? toDraft(record, schema),
    [drafts]
  )

  const clearDraft = useCallback((recordKey: string) => {
    setDrafts(({ [recordKey]: _removed, ...rest }) => rest)
  }, [])

  const setDraft = useCallback((recordKey: string, draft: ConfigDraft) => {
    setDrafts((prev) => ({ ...prev, [recordKey]: draft }))
  }, [])

  const clearAll = useCallback(() => setDrafts({}), [])

  // JSON.stringify trên mọi record là đủ nặng để không nên chạy lại mỗi lần render.
  const dirtyRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          Object.hasOwn(drafts, record.recordKey) &&
          !isDraftEqual(
            drafts[record.recordKey],
            toDraft(record, resolveRecordSchema(record))
          )
      ),
    [records, drafts]
  )

  const dirtyKeys = useMemo(
    () => dirtyRecords.map((record) => record.recordKey),
    [dirtyRecords]
  )

  return {
    drafts,
    getDraft,
    setDraft,
    clearDraft,
    clearAll,
    dirtyRecords,
    dirtyKeys,
  }
}
