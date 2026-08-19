import { useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  IconAdjustmentsOff,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react"

import { getGetEnglishConfigRecordsQueryOptions } from "@/apis/english-config/english-config.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfigSaveBar } from "@/features/config/components/config-save-bar.tsx"
import { ConfigSearchResults } from "@/features/config/components/config-search-results.tsx"
import { ConfigSnapshotSection } from "@/features/config/components/config-snapshot-section.tsx"
import { ConfigTabPanel } from "@/features/config/components/config-tab-panel.tsx"
import {
  CONFIG_TAB_META,
  CONFIG_TABS,
  DEFAULT_CONFIG_TAB,
} from "@/features/config/constants.ts"
import { useConfigDrafts } from "@/features/config/hooks/use-config-drafts.ts"
import { useConfigRecords } from "@/features/config/hooks/use-config-records.ts"
import { useResetConfigRecord } from "@/features/config/hooks/use-reset-config-record.ts"
import { useSaveAllConfig } from "@/features/config/hooks/use-save-all-config.ts"
import { useUpdateConfigRecord } from "@/features/config/hooks/use-update-config-record.ts"
import type { ConfigRecord, ConfigTabKey } from "@/features/config/types.ts"
import { filterConfigRecords } from "@/features/config/utils/filter-config-records.ts"
import { resolveRecordSchema } from "@/features/config/utils/parse-config-schema.ts"
import { validateConfigGroups } from "@/features/config/utils/validate-config-group.ts"
import { validateConfigValue } from "@/features/config/utils/validate-config-value.ts"

interface ConfigSearch {
  tab?: ConfigTabKey
  q?: string
}

export const Route = createFileRoute("/_dashboard/config")({
  validateSearch: (search: Record<string, unknown>): ConfigSearch => {
    const tab = CONFIG_TABS.find((value) => value === search.tab)
    const q = typeof search.q === "string" ? search.q.trim() : ""
    // Tab mặc định không đẩy vào URL để `/config` luôn là URL chuẩn của nó.
    return {
      ...(tab && tab !== DEFAULT_CONFIG_TAB ? { tab } : {}),
      ...(q ? { q } : {}),
    }
  },
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(getGetEnglishConfigRecordsQueryOptions()),
  component: ConfigPage,
})

function ConfigPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const activeTab = search.tab ?? DEFAULT_CONFIG_TAB
  const query = search.q ?? ""

  const { records, groups, isPending, isError, error, refetch, isRefetching } =
    useConfigRecords()
  const {
    drafts,
    getDraft,
    setDraft,
    clearDraft,
    clearAll,
    dirtyRecords,
    dirtyKeys,
  } = useConfigDrafts(records)
  const { updateRecord, pendingRecordKey: savingKey } = useUpdateConfigRecord()
  const { resetRecord, pendingRecordKey: resettingKey } = useResetConfigRecord()
  const { saveAll, isSaving } = useSaveAllConfig()

  const groupErrors = useMemo(
    () => validateConfigGroups(records, drafts),
    [records, drafts]
  )
  const results = useMemo(
    () => filterConfigRecords(records, query),
    [records, query]
  )

  // Phải gộp cả lỗi từng field lẫn lỗi chéo: chỉ đếm lỗi chéo thì ô số bị xoá trắng
  // vẫn cho bấm "Lưu tất cả" rồi gửi Number("") === 0 lên server.
  const invalidKeys = useMemo(
    () =>
      dirtyRecords
        .filter((record) => {
          const fieldError = validateConfigValue(
            record,
            resolveRecordSchema(record),
            drafts[record.recordKey]
          )
          return Boolean(fieldError ?? groupErrors[record.recordKey])
        })
        .map((record) => record.recordKey),
    [dirtyRecords, drafts, groupErrors]
  )

  const labelOf = (record: ConfigRecord) => record.label || record.recordKey

  const handleSave = async (record: ConfigRecord, value: unknown) => {
    const saved = await updateRecord(record.recordKey, value, labelOf(record))
    if (saved) clearDraft(record.recordKey)
  }

  const handleReset = async (record: ConfigRecord) => {
    const reset = await resetRecord(record.recordKey, labelOf(record))
    if (reset) clearDraft(record.recordKey)
  }

  const handleSaveAll = async () => {
    const saved = await saveAll(dirtyRecords, drafts)
    if (saved) clearAll()
  }

  const rowProps = {
    getDraft: (record: ConfigRecord) =>
      getDraft(record, resolveRecordSchema(record)),
    groupErrors,
    savingKey,
    resettingKey,
    onDraftChange: (
      record: ConfigRecord,
      draft: Parameters<typeof setDraft>[1]
    ) => setDraft(record.recordKey, draft),
    onSave: (record: ConfigRecord, value: unknown) =>
      void handleSave(record, value),
    onRevert: (record: ConfigRecord) => clearDraft(record.recordKey),
    onReset: (record: ConfigRecord) => void handleReset(record),
  }

  const dirtyByTab = useMemo(() => {
    const counts = new Map<ConfigTabKey, number>()
    for (const group of groups) {
      const dirty = group.records.filter((record) =>
        dirtyKeys.includes(record.recordKey)
      ).length
      counts.set(group.tab, dirty)
    }
    return counts
  }, [groups, dirtyKeys])

  const changedByTab = useMemo(() => {
    const counts = new Map<ConfigTabKey, number>()
    for (const group of groups) {
      const changed = group.records.filter(
        (record) =>
          JSON.stringify(record.value) !== JSON.stringify(record.defaultValue)
      ).length
      counts.set(group.tab, changed)
    }
    return counts
  }, [groups])

  return (
    <>
      <PageHeader
        title="Cấu hình"
        description="Tham số vận hành của bot, gom theo từng pipeline: kho câu hỏi, bài đọc và câu hỏi đọc hiểu."
        actions={
          <>
            <div className="relative">
              <IconSearch
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                stroke={1.5}
              />
              <Input
                className="h-9 w-56 rounded-3xl pl-9"
                placeholder="Tìm cấu hình..."
                value={query}
                onChange={(event) =>
                  void navigate({
                    search: (prev) => ({
                      ...prev,
                      q: event.target.value.trim()
                        ? event.target.value
                        : undefined,
                    }),
                    replace: true,
                  })
                }
              />
            </div>
            <Button
              variant="outline"
              onClick={() => void refetch()}
              disabled={isRefetching}
            >
              <IconRefresh stroke={1.5} data-icon="inline-start" />
              Làm mới
            </Button>
          </>
        }
      />

      {isError ? (
        <QueryError
          title="Không tải được cấu hình"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : isPending ? (
        <div className="space-y-6">
          <Skeleton className="h-9 w-80 rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-4xl" />
          <Skeleton className="h-48 w-full rounded-4xl" />
        </div>
      ) : records.length === 0 ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconAdjustmentsOff stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Chưa có mục cấu hình nào</EmptyTitle>
            <EmptyDescription>
              Backend chưa khai báo record cấu hình nào để chỉnh từ dashboard.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : query ? (
        <ConfigSearchResults results={results} query={query} {...rowProps} />
      ) : (
        <>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              void navigate({
                search: (prev) => ({
                  ...prev,
                  tab:
                    value === DEFAULT_CONFIG_TAB
                      ? undefined
                      : (value as ConfigTabKey),
                }),
                replace: true,
              })
            }
          >
            <TabsList>
              {groups.map((group) => {
                const meta = CONFIG_TAB_META[group.tab]
                const TabIcon = meta.icon
                const dirty = dirtyByTab.get(group.tab) ?? 0
                const changed = changedByTab.get(group.tab) ?? 0
                return (
                  <TabsTrigger key={group.tab} value={group.tab}>
                    <TabIcon stroke={1.5} data-icon="inline-start" />
                    {meta.label}
                    {dirty > 0 ? (
                      <Badge variant="destructive">{dirty}</Badge>
                    ) : changed > 0 ? (
                      <Badge variant="outline">{changed}</Badge>
                    ) : null}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {groups.map((group) => (
              <TabsContent key={group.tab} value={group.tab} className="pt-4">
                <p className="pb-4 text-sm text-muted-foreground">
                  {CONFIG_TAB_META[group.tab].description}
                </p>
                <ConfigTabPanel group={group} {...rowProps} />
              </TabsContent>
            ))}
          </Tabs>

          <ConfigSnapshotSection />
        </>
      )}

      <ConfigSaveBar
        dirtyCount={dirtyKeys.length}
        errorCount={invalidKeys.length}
        isSaving={isSaving}
        onDiscard={clearAll}
        onSave={() => void handleSaveAll()}
      />
    </>
  )
}
