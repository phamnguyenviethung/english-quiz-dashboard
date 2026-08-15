import { useMemo, useState } from "react"
import {
  IconCircleCheck,
  IconClockBolt,
  IconCpu,
  IconHandClick,
  IconPlus,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { StatTile, StatTileGrid } from "@/components/common/stat-tile.tsx"
import { StatusBadge } from "@/components/common/status-badge.tsx"
import {
  STICKY_CELL_LEFT,
  STICKY_CELL_RIGHT,
  StickyTable,
} from "@/components/common/sticky-table.tsx"
import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatModelName } from "@/features/quiz/constants.ts"
import {
  formatDateTime,
  formatNumber,
  formatUsdPerMillion,
} from "@/lib/format.ts"
import { cn } from "@/lib/utils"

import { MODEL_CONTEXT_META, MODEL_STATUS_META } from "../constants.ts"
import { useAiModels } from "../hooks/use-ai-models.ts"
import { usePoolModelUsage } from "../hooks/use-pool-model-usage.ts"
import {
  useSyncAllModelsPricing,
  useSyncModelPricing,
} from "../hooks/use-sync-model-pricing.ts"
import type { AiModel } from "../types.ts"
import { countProviderOptions } from "../utils/provider-preferences.ts"
import { AiModelFormDialog } from "./ai-model-form-dialog.tsx"
import { AiModelRowActions } from "./ai-model-row-actions.tsx"
import { ModelCatalogDialog } from "./model-catalog-dialog.tsx"

const COLUMN_COUNT = 7

/**
 * Nền hàng phải đặc thì cột ghim (`bg-inherit`) mới che được nội dung cuộn phía
 * dưới — nền trong suốt bị ô ghim vẽ chồng thêm một lớp nữa nên cột đó đậm hơn
 * hẳn. Vì vậy model đã tắt dùng `bg-muted` đặc, và bỏ luôn hover: bảng không có
 * hành động ở cấp hàng, mà tô hover cũng sẽ trùng đúng màu của hàng đã tắt.
 */
const ROW_ACTIVE = "bg-card hover:bg-card"
const ROW_INACTIVE = "bg-muted hover:bg-muted"

const SKELETON_COLUMN_CLASSES = [
  STICKY_CELL_LEFT,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  cn(STICKY_CELL_RIGHT, "p-1 md:p-3"),
]

function ModelIdCell({ modelId }: { modelId: string }) {
  const { provider, name, suffix } = formatModelName(modelId)

  return (
    <div className="flex flex-col gap-0.5 font-mono text-xs">
      <span className="text-foreground">
        {provider ? (
          <span className="text-muted-foreground">{provider}/</span>
        ) : null}
        {name}
        {suffix ? (
          <span className="text-muted-foreground">:{suffix}</span>
        ) : null}
      </span>
    </div>
  )
}

/**
 * Badge cho 3 ngữ cảnh. Mỗi ngữ cảnh một hue riêng khi bật (xem MODEL_CONTEXT_META)
 * để quét bảng là biết model phục vụ đường nào; tắt thì xám mờ hẳn đi. Kèm số tuỳ
 * chọn provider nếu có cấu hình riêng.
 */
function ContextsCell({ model }: { model: AiModel }) {
  const entries = [
    {
      key: "schedule" as const,
      enabled: model.scheduleEnabled,
      options: countProviderOptions(model.scheduleProvider),
    },
    {
      key: "manual" as const,
      enabled: model.manualEnabled,
      options: countProviderOptions(model.manualProvider),
    },
    {
      key: "reading" as const,
      enabled: model.readingEnabled,
      options: countProviderOptions(model.readingProvider),
    },
  ]

  return (
    <div className="flex flex-wrap gap-1">
      {entries.map((entry) => {
        const meta = MODEL_CONTEXT_META[entry.key]
        const label =
          entry.enabled && entry.options > 0
            ? `${meta.label} · ${entry.options}`
            : meta.label

        return entry.enabled ? (
          <StatusBadge
            key={entry.key}
            meta={{
              label,
              variant: "secondary",
              tone: meta.tone,
              icon: meta.icon,
            }}
          />
        ) : (
          <Badge
            key={entry.key}
            variant="outline"
            className="text-muted-foreground"
          >
            {label}
          </Badge>
        )
      })}
    </div>
  )
}

function PriceCell({ model }: { model: AiModel }) {
  const hasPrice =
    model.pricePromptPerToken !== null || model.priceCompletionPerToken !== null

  // Thiếu giá là việc cần xử lý (bấm đồng bộ) nên tô amber cho nổi, thay vì để
  // chìm trong một rừng dấu gạch.
  if (!hasPrice) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Chưa có
            </span>
          }
        />
        <TooltipContent>
          Chưa có giá. Bấm đồng bộ để lấy từ OpenRouter.
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className="flex flex-col gap-0.5 text-xs tabular-nums">
            <span>{formatUsdPerMillion(model.pricePromptPerToken)}</span>
            <span className="text-muted-foreground">
              {formatUsdPerMillion(model.priceCompletionPerToken)}
            </span>
          </div>
        }
      />
      <TooltipContent>
        USD trên 1 triệu token: đầu vào / đầu ra.
        {model.pricingSyncedAt
          ? ` Đồng bộ ${formatDateTime(model.pricingSyncedAt)}.`
          : ""}
      </TooltipContent>
    </Tooltip>
  )
}

function AiModelsTable({
  models,
  isPending,
  usageByModelId,
}: {
  models: AiModel[]
  isPending: boolean
  usageByModelId: Map<string, number>
}) {
  const { syncModelPricing, pendingId } = useSyncModelPricing()

  return (
    <StickyTable>
      <TableHeader>
        <TableRow className="bg-card hover:bg-card">
          <TableHead className={cn(STICKY_CELL_LEFT, "w-28")}>Key</TableHead>
          <TableHead>Model ID</TableHead>
          <TableHead className="w-32">Trạng thái</TableHead>
          <TableHead className="w-52">Ngữ cảnh</TableHead>
          <TableHead className="w-28 text-right">Giá /1M</TableHead>
          <TableHead className="w-24 text-right">Đã sinh</TableHead>
          <TableHead className={cn(STICKY_CELL_RIGHT, "w-12 md:w-48")} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isPending ? (
          <TableSkeletonRows
            columns={COLUMN_COUNT}
            rowClassName={ROW_ACTIVE}
            columnClassNames={SKELETON_COLUMN_CLASSES}
          />
        ) : (
          models.map((model) => {
            const status =
              MODEL_STATUS_META[model.isActive ? "active" : "inactive"]
            const usage = usageByModelId.get(model.modelId)

            return (
              // Nền xám cho model đã tắt: tín hiệu quét mạnh hơn cả badge.
              <TableRow
                key={model.id}
                className={model.isActive ? ROW_ACTIVE : ROW_INACTIVE}
              >
                {/*
                  TableCell mặc định whitespace-nowrap nên key dài sẽ kéo cột ghim
                  rộng ra và nuốt gần hết khung cuộn ở 375px. Cho xuống dòng ở
                  mobile để cột giữ đúng w-28.
                */}
                <TableCell
                  className={cn(
                    STICKY_CELL_LEFT,
                    "font-medium break-all whitespace-normal md:break-normal md:whitespace-nowrap",
                    !model.isActive && "text-muted-foreground"
                  )}
                >
                  {model.key}
                </TableCell>
                <TableCell>
                  <ModelIdCell modelId={model.modelId} />
                </TableCell>
                <TableCell>
                  <StatusBadge meta={status} />
                </TableCell>
                <TableCell>
                  <ContextsCell model={model} />
                </TableCell>
                <TableCell className="text-right">
                  <PriceCell model={model} />
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right text-xs tabular-nums",
                    usage === undefined
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                >
                  {usage === undefined ? "-" : formatNumber(usage)}
                </TableCell>
                <TableCell className={cn(STICKY_CELL_RIGHT, "p-1 md:p-3")}>
                  <AiModelRowActions
                    model={model}
                    isSyncing={pendingId === model.id}
                    onSyncPricing={() => void syncModelPricing(model.id)}
                  />
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </StickyTable>
  )
}

/**
 * Chỉ đếm model vừa bật vừa mở ngữ cảnh đó — model đã tắt không phục vụ đường nào.
 * Một ngữ cảnh về 0 nghĩa là hàng đợi sinh câu hỏi của đường đó đứng.
 */
function AiModelsSummary({ models }: { models: AiModel[] }) {
  const summary = useMemo(() => {
    const active = models.filter((model) => model.isActive)
    return {
      total: models.length,
      active: active.length,
      schedule: active.filter((model) => model.scheduleEnabled).length,
      manual: active.filter((model) => model.manualEnabled).length,
    }
  }, [models])

  return (
    <StatTileGrid className="mb-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="Tổng model" value={summary.total} icon={IconCpu} />
      <StatTile
        label="Đang hoạt động"
        value={summary.active}
        icon={IconCircleCheck}
        tone={summary.active === 0 ? "danger" : "default"}
      />
      <StatTile
        label="Ngữ cảnh Tự động"
        value={summary.schedule}
        icon={IconClockBolt}
        tone={summary.schedule === 0 ? "danger" : "default"}
        hint={
          summary.schedule === 0 ? "Cron không có model để chọn" : undefined
        }
      />
      <StatTile
        label="Ngữ cảnh Thủ công"
        value={summary.manual}
        icon={IconHandClick}
        tone={summary.manual === 0 ? "danger" : "default"}
        hint={summary.manual === 0 ? "Bổ sung kho thủ công sẽ lỗi" : undefined}
      />
    </StatTileGrid>
  )
}

export function AiModelsPanel({ className }: { className?: string }) {
  const { models, isPending, isError, error, refetch } = useAiModels()
  const { usageByModelId } = usePoolModelUsage()
  const { syncAllModelsPricing, isPending: isSyncingAll } =
    useSyncAllModelsPricing()

  // Chọn model từ catalog sẽ mở form thêm mới với modelId điền sẵn.
  const [presetModelId, setPresetModelId] = useState<string>()

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconCpu className="size-4 text-muted-foreground" stroke={1.5} />
          <CardTitle>Danh sách model</CardTitle>
        </div>
        <CardDescription>
          Model được chọn ngẫu nhiên trong số các model đang bật của từng ngữ
          cảnh. Tắt một model để loại nó khỏi vòng chọn mà không mất lịch sử.
        </CardDescription>

        {/*
          Cố tình không dùng CardAction: slot đó ép CardHeader sang
          grid-cols-[1fr_auto], ba nút bị nhồi vào cột phải và wrap răng cưa ở
          khoảng 640-900px trong khi description bị bóp thành dải mỏng. Cho hàng
          action xuống một dòng riêng rộng bằng card thì mọi breakpoint dùng
          chung một quy tắc wrap, và thứ tự DOM trùng thứ tự nhìn thấy nên tab
          order không còn nhảy cóc như lúc dùng order-*.
        */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {/*
            Không thêm min-w-0: Button có whitespace-nowrap nên giữ
            min-width:auto để ở ~320px nút thứ hai tự rơi xuống dòng riêng thay
            vì tràn chữ ra ngoài.
          */}
          <Button
            variant="outline"
            className="h-11 flex-1 sm:h-9 sm:flex-none"
            onClick={() => void syncAllModelsPricing()}
            disabled={isSyncingAll || models.length === 0}
          >
            {isSyncingAll ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <IconRefresh stroke={1.5} data-icon="inline-start" />
            )}
            Đồng bộ giá
          </Button>

          <ModelCatalogDialog
            existingModels={models}
            onPick={setPresetModelId}
            trigger={
              <Button
                variant="outline"
                className="h-11 flex-1 sm:h-9 sm:flex-none"
              >
                <IconSearch stroke={1.5} data-icon="inline-start" />
                Duyệt catalog
              </Button>
            }
          />

          <AiModelFormDialog
            trigger={
              <Button className="h-11 w-full sm:ml-auto sm:h-9 sm:w-auto">
                <IconPlus stroke={1.5} data-icon="inline-start" />
                Thêm model
              </Button>
            }
          />
        </div>
      </CardHeader>

      <CardContent>
        {isError ? (
          <QueryError
            title="Không tải được danh sách model"
            error={error}
            onRetry={() => void refetch()}
          />
        ) : !isPending && models.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-10 text-center">
            <IconCpu className="size-6 text-muted-foreground" stroke={1.5} />
            <div className="space-y-1">
              <p className="text-sm font-medium">Chưa có model nào</p>
              <p className="text-xs text-muted-foreground">
                Thêm model đầu tiên để hàng đợi sinh câu hỏi có thể chạy.
              </p>
            </div>
            <AiModelFormDialog
              trigger={
                <Button size="sm" className="h-11 sm:h-8">
                  <IconPlus stroke={1.5} data-icon="inline-start" />
                  Thêm model
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {isPending ? null : <AiModelsSummary models={models} />}
            <AiModelsTable
              models={models}
              isPending={isPending}
              usageByModelId={usageByModelId}
            />
          </>
        )}
      </CardContent>

      {/* Form điều khiển từ ngoài để catalog có thể mở nó kèm modelId đã chọn. */}
      <AiModelFormDialog
        key={presetModelId}
        presetModelId={presetModelId}
        open={presetModelId !== undefined}
        onOpenChange={(open) => {
          if (!open) setPresetModelId(undefined)
        }}
      />
    </Card>
  )
}
