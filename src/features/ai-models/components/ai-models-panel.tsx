import { useMemo, useState } from "react"
import {
  IconBook,
  IconCheck,
  IconClockBolt,
  IconCopy,
  IconCpu,
  IconHandClick,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconX,
} from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { StickyTable } from "@/components/common/sticky-table.tsx"
import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatModelName } from "@/features/quiz/constants.ts"
import { copyText } from "@/lib/clipboard.ts"
import {
  formatDateTime,
  formatNumber,
  formatUsdPerMillion,
} from "@/lib/format.ts"
import { cn } from "@/lib/utils"

import { useAiModels } from "../hooks/use-ai-models.ts"
import { usePoolModelUsage } from "../hooks/use-pool-model-usage.ts"
import {
  useSyncAllModelsPricing,
  useSyncModelPricing,
} from "../hooks/use-sync-model-pricing.ts"
import type { AiModel } from "../types.ts"
import { countProviderOptions } from "../utils/provider-preferences.ts"
import { AiModelCard } from "./ai-model-card.tsx"
import { AiModelFormDialog } from "./ai-model-form-dialog.tsx"
import { AiModelsFilterBar } from "./ai-models-filter-bar.tsx"
import type {
  ModelFilterCounts,
  ModelFilterTab,
} from "./ai-models-filter-bar.tsx"
import { AiModelRowActions } from "./ai-model-row-actions.tsx"
import { ModelCatalogDialog } from "./model-catalog-dialog.tsx"

const COLUMN_COUNT = 6

/** Cell hiển thị định danh model trên Desktop kèm nút copy nhanh */
function DesktopModelCell({ model }: { model: AiModel }) {
  const [copied, setCopied] = useState(false)
  const { provider, name, suffix } = formatModelName(model.modelId)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const ok = await copyText(model.modelId)
    if (ok) {
      setCopied(true)
      toast.add({
        type: "info",
        title: "Đã sao chép Model ID",
        description: model.modelId,
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm font-semibold tracking-tight text-foreground",
            !model.isActive && "text-muted-foreground"
          )}
        >
          {model.key}
        </span>
        {provider ? (
          <span className="rounded-md bg-muted/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {provider}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="group flex max-w-sm items-center gap-1.5 text-left font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        title="Sao chép Model ID"
      >
        <span className="truncate">
          {provider ? `${provider}/` : ""}
          {name}
          {suffix ? `:${suffix}` : ""}
        </span>
        {copied ? (
          <IconCheck className="size-3 shrink-0 text-emerald-500" />
        ) : (
          <IconCopy className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>
    </div>
  )
}

/** Cell hiển thị các ngữ cảnh đang bật của model trên Desktop */
function DesktopContextsCell({ model }: { model: AiModel }) {
  const scheduleOptions = countProviderOptions(model.scheduleProvider)
  const manualOptions = countProviderOptions(model.manualProvider)
  const readingOptions = countProviderOptions(model.readingProvider)

  const hasAnyContext =
    model.scheduleEnabled || model.manualEnabled || model.readingEnabled

  if (!hasAnyContext) {
    return (
      <span className="text-xs text-amber-600 italic dark:text-amber-400">
        Chưa gán ngữ cảnh
      </span>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {model.scheduleEnabled ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
          <IconClockBolt
            className="size-3 text-muted-foreground"
            stroke={1.5}
          />
          Tự động
          {scheduleOptions > 0 ? (
            <span className="font-mono text-muted-foreground">
              · {scheduleOptions}
            </span>
          ) : null}
        </span>
      ) : null}

      {model.manualEnabled ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
          <IconHandClick
            className="size-3 text-muted-foreground"
            stroke={1.5}
          />
          Thủ công
          {manualOptions > 0 ? (
            <span className="font-mono text-muted-foreground">
              · {manualOptions}
            </span>
          ) : null}
        </span>
      ) : null}

      {model.readingEnabled ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
          <IconBook className="size-3 text-muted-foreground" stroke={1.5} />
          Bài đọc
          {readingOptions > 0 ? (
            <span className="font-mono text-muted-foreground">
              · {readingOptions}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}

/** Cell hiển thị giá token trên Desktop */
function DesktopPriceCell({ model }: { model: AiModel }) {
  const hasPrice =
    model.pricePromptPerToken !== null || model.priceCompletionPerToken !== null

  if (!hasPrice) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Chưa có giá
            </span>
          }
        />
        <TooltipContent>
          Chưa có giá. Bấm nút đồng bộ ở cột thao tác để lấy từ OpenRouter.
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className="flex flex-col items-end gap-0.5 text-xs tabular-nums">
            <span className="font-medium text-foreground">
              ${formatUsdPerMillion(model.pricePromptPerToken)}
            </span>
            <span className="text-muted-foreground">
              ${formatUsdPerMillion(model.priceCompletionPerToken)}
            </span>
          </div>
        }
      />
      <TooltipContent>
        Giá USD trên 1 triệu token (Vào / Ra).
        {model.pricingSyncedAt
          ? ` Đồng bộ lúc ${formatDateTime(model.pricingSyncedAt)}.`
          : ""}
      </TooltipContent>
    </Tooltip>
  )
}

/** Cell trạng thái trên Desktop */
function DesktopStatusCell({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 text-xs font-normal text-emerald-700 dark:text-emerald-400"
      >
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Hoạt động
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="gap-1.5 px-2 py-0.5 text-xs font-normal text-muted-foreground"
    >
      <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      Đã tắt
    </Badge>
  )
}

export function AiModelsPanel({ className }: { className?: string }) {
  const { models, isPending, isError, error, refetch } = useAiModels()
  const { usageByModelId } = usePoolModelUsage()
  const { syncAllModelsPricing, isPending: isSyncingAll } =
    useSyncAllModelsPricing()
  const { syncModelPricing, pendingId } = useSyncModelPricing()

  // Chọn model từ catalog sẽ mở form thêm mới với modelId điền sẵn.
  const [presetModelId, setPresetModelId] = useState<string>()

  // Trạng thái tìm kiếm & lọc
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<ModelFilterTab>("all")

  // Thống kê số lượng cho các filter pills
  const counts: ModelFilterCounts = useMemo(() => {
    const active = models.filter((m) => m.isActive)
    return {
      total: models.length,
      active: active.length,
      schedule: active.filter((m) => m.scheduleEnabled).length,
      manual: active.filter((m) => m.manualEnabled).length,
      reading: active.filter((m) => m.readingEnabled).length,
      inactive: models.length - active.length,
    }
  }, [models])

  // Lọc danh sách theo tab và từ khoá tìm kiếm
  const filteredModels = useMemo(() => {
    const q = search.trim().toLowerCase()

    return models.filter((model) => {
      // Lọc theo Tab
      if (activeTab === "active" && !model.isActive) return false
      if (activeTab === "inactive" && model.isActive) return false
      if (
        activeTab === "schedule" &&
        (!model.isActive || !model.scheduleEnabled)
      )
        return false
      if (activeTab === "manual" && (!model.isActive || !model.manualEnabled))
        return false
      if (activeTab === "reading" && (!model.isActive || !model.readingEnabled))
        return false

      // Lọc theo Từ khoá
      if (q) {
        const matchKey = model.key.toLowerCase().includes(q)
        const matchId = model.modelId.toLowerCase().includes(q)
        return matchKey || matchId
      }

      return true
    })
  }, [models, activeTab, search])

  const isFiltered = search.trim() !== "" || activeTab !== "all"

  const handleResetFilters = () => {
    setSearch("")
    setActiveTab("all")
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">AI Models</h1>
          </div>
          <p className="max-w-[70ch] text-xs text-muted-foreground sm:text-sm">
            Quản lý model OpenRouter sinh câu hỏi: bật/tắt theo ngữ cảnh, định
            tuyến provider và giá token.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium"
            onClick={() => void syncAllModelsPricing()}
            disabled={isSyncingAll || models.length === 0}
          >
            {isSyncingAll ? (
              <Spinner className="size-3.5" />
            ) : (
              <IconRefresh className="size-3.5" stroke={1.5} />
            )}
            Đồng bộ giá
          </Button>

          <ModelCatalogDialog
            existingModels={models}
            onPick={setPresetModelId}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs font-medium"
              >
                <IconSearch className="size-3.5" stroke={1.5} />
                Duyệt catalog
              </Button>
            }
          />

          <AiModelFormDialog
            trigger={
              <Button
                size="sm"
                className="h-9 gap-1.5 text-xs font-medium shadow-2xs"
              >
                <IconPlus className="size-3.5" stroke={2} />
                Thêm model
              </Button>
            }
          />
        </div>
      </div>

      {/* 2. Error State */}
      {isError ? (
        <QueryError
          title="Không tải được danh sách model"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : null}

      {/* 3. Empty State (Khi database chưa có model nào) */}
      {!isPending && !isError && models.length === 0 ? (
        <Empty className="rounded-3xl border border-dashed py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconCpu className="size-6" stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Chưa có AI Model nào</EmptyTitle>
            <EmptyDescription className="max-w-md">
              Hệ thống cần ít nhất một model đang hoạt động để hàng đợi sinh câu
              hỏi tự động và thủ công có thể hoạt động.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <AiModelFormDialog
              trigger={
                <Button className="gap-1.5">
                  <IconPlus className="size-4" stroke={2} />
                  Thêm model đầu tiên
                </Button>
              }
            />
          </EmptyContent>
        </Empty>
      ) : null}

      {/* 4. Filter Bar & Data Views (Khi có data hoặc đang loading) */}
      {!isError && (models.length > 0 || isPending) ? (
        <div className="flex flex-col gap-4">
          {/* Thanh tìm kiếm và Filter Pills */}
          <AiModelsFilterBar
            search={search}
            onSearchChange={setSearch}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />

          {/* Dòng trạng thái khi đang lọc */}
          {isFiltered && !isPending ? (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Hiển thị{" "}
                <strong className="font-semibold text-foreground">
                  {filteredModels.length}
                </strong>{" "}
                trong số {models.length} model
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 font-medium text-primary transition-colors hover:underline"
              >
                <IconX className="size-3" stroke={2} />
                Xoá bộ lọc
              </button>
            </div>
          ) : null}

          {/* Skeleton Loaders khi đang tải dữ liệu */}
          {isPending ? (
            <>
              {/* Mobile Skeleton Cards */}
              <div className="flex flex-col gap-3 md:hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32 rounded-md" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-48 rounded-md" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-md" />
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-4 w-16 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Skeleton Table */}
              <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-2xs md:block">
                <StickyTable>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead className="w-32">Trạng thái</TableHead>
                      <TableHead className="w-56">Ngữ cảnh</TableHead>
                      <TableHead className="w-36 text-right">
                        Giá / 1M
                      </TableHead>
                      <TableHead className="w-28 text-right">Đã sinh</TableHead>
                      <TableHead className="w-36 text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableSkeletonRows columns={COLUMN_COUNT} />
                  </TableBody>
                </StickyTable>
              </div>
            </>
          ) : null}

          {/* Không có kết quả sau khi lọc */}
          {!isPending && models.length > 0 && filteredModels.length === 0 ? (
            <Empty className="rounded-2xl border border-dashed py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconSearch className="size-5 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Không tìm thấy model nào</EmptyTitle>
                <EmptyDescription>
                  Không có model nào khớp với điều kiện lọc hiện tại. Thử đổi từ
                  khoá hoặc reset bộ lọc.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-1.5"
                >
                  <IconX className="size-3.5" stroke={2} />
                  Xoá bộ lọc
                </Button>
              </EmptyContent>
            </Empty>
          ) : null}

          {/* Danh sách Model khi đã có dữ liệu */}
          {!isPending && filteredModels.length > 0 ? (
            <>
              {/* Chế độ xem Mobile: Danh sách Cards tinh tế, touch-friendly */}
              <div className="flex flex-col gap-3 md:hidden">
                {filteredModels.map((model) => (
                  <AiModelCard
                    key={model.id}
                    model={model}
                    usage={usageByModelId.get(model.modelId)}
                    isSyncing={pendingId === model.id}
                    onSyncPricing={() => void syncModelPricing(model.id)}
                  />
                ))}
              </div>

              {/* Chế độ xem Desktop: Bảng thoáng đãng, sắc nét */}
              <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-2xs md:block">
                <StickyTable>
                  <TableHeader>
                    <TableRow className="bg-card hover:bg-card">
                      <TableHead>Model</TableHead>
                      <TableHead className="w-32">Trạng thái</TableHead>
                      <TableHead className="w-60">Ngữ cảnh</TableHead>
                      <TableHead className="w-36 text-right">
                        Giá / 1M token
                      </TableHead>
                      <TableHead className="w-28 text-right">Đã sinh</TableHead>
                      <TableHead className="w-36 text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModels.map((model) => {
                      const usage = usageByModelId.get(model.modelId)

                      return (
                        <TableRow
                          key={model.id}
                          className={cn(
                            "transition-colors",
                            !model.isActive && "opacity-80"
                          )}
                        >
                          <TableCell className="py-3">
                            <DesktopModelCell model={model} />
                          </TableCell>

                          <TableCell className="py-3">
                            <DesktopStatusCell isActive={model.isActive} />
                          </TableCell>

                          <TableCell className="py-3">
                            <DesktopContextsCell model={model} />
                          </TableCell>

                          <TableCell className="py-3 text-right">
                            <DesktopPriceCell model={model} />
                          </TableCell>

                          <TableCell className="py-3 text-right text-xs tabular-nums">
                            {usage === undefined ? (
                              <span className="text-muted-foreground">-</span>
                            ) : (
                              <span className="font-medium text-foreground">
                                {formatNumber(usage)}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="py-3 text-right">
                            <AiModelRowActions
                              model={model}
                              isSyncing={pendingId === model.id}
                              onSyncPricing={() =>
                                void syncModelPricing(model.id)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </StickyTable>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {/* Form điều khiển từ ngoài để Catalog có thể mở nó kèm modelId đã chọn */}
      <AiModelFormDialog
        key={presetModelId}
        presetModelId={presetModelId}
        open={presetModelId !== undefined}
        onOpenChange={(open) => {
          if (!open) setPresetModelId(undefined)
        }}
      />
    </div>
  )
}
