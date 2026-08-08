import { useState } from "react"
import {
  IconCpu,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
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

import { MODEL_CONTEXT_LABELS, MODEL_STATUS_META } from "../constants.ts"
import { useAiModels } from "../hooks/use-ai-models.ts"
import { usePoolModelUsage } from "../hooks/use-pool-model-usage.ts"
import {
  useSyncAllModelsPricing,
  useSyncModelPricing,
} from "../hooks/use-sync-model-pricing.ts"
import type { AiModel } from "../types.ts"
import { countProviderOptions } from "../utils/provider-preferences.ts"
import { AiModelFormDialog } from "./ai-model-form-dialog.tsx"
import { AiModelStatusToggle } from "./ai-model-status-toggle.tsx"
import { ModelCatalogDialog } from "./model-catalog-dialog.tsx"

const COLUMN_COUNT = 7

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
 * Badge cho 2 ngữ cảnh. Chỉ badge "bật" mới nổi bật để quét bảng nhanh biết model
 * đang phục vụ đường nào; kèm số tuỳ chọn provider nếu có cấu hình riêng.
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
  ]

  return (
    <div className="flex flex-wrap gap-1">
      {entries.map((entry) => (
        <Badge
          key={entry.key}
          variant={entry.enabled ? "secondary" : "outline"}
          className={entry.enabled ? undefined : "text-muted-foreground"}
        >
          {MODEL_CONTEXT_LABELS[entry.key]}
          {entry.enabled && entry.options > 0 ? ` · ${entry.options}` : ""}
        </Badge>
      ))}
    </div>
  )
}

function PriceCell({ model }: { model: AiModel }) {
  const hasPrice =
    model.pricePromptPerToken !== null || model.priceCompletionPerToken !== null

  if (!hasPrice) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={<span className="text-xs text-muted-foreground">-</span>}
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
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Model ID</TableHead>
            <TableHead className="w-32">Trạng thái</TableHead>
            <TableHead className="w-44">Ngữ cảnh</TableHead>
            <TableHead className="w-28 text-right">Giá /1M</TableHead>
            <TableHead className="w-24 text-right">Đã sinh</TableHead>
            <TableHead className="w-48" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows columns={COLUMN_COUNT} />
          ) : (
            models.map((model) => {
              const status =
                MODEL_STATUS_META[model.isActive ? "active" : "inactive"]
              const usage = usageByModelId.get(model.modelId)

              return (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.key}</TableCell>
                  <TableCell>
                    <ModelIdCell modelId={model.modelId} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <ContextsCell model={model} />
                  </TableCell>
                  <TableCell className="text-right">
                    <PriceCell model={model} />
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground tabular-nums">
                    {usage === undefined ? "-" : formatNumber(usage)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label={`Đồng bộ giá model ${model.key}`}
                              disabled={pendingId === model.id}
                              onClick={() => void syncModelPricing(model.id)}
                            >
                              {pendingId === model.id ? (
                                <Spinner />
                              ) : (
                                <IconRefresh stroke={1.5} />
                              )}
                            </Button>
                          }
                        />
                        <TooltipContent>Đồng bộ giá</TooltipContent>
                      </Tooltip>
                      <AiModelFormDialog
                        model={model}
                        trigger={
                          <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label={`Sửa model ${model.key}`}
                          >
                            <IconPencil stroke={1.5} />
                          </Button>
                        }
                      />
                      <AiModelStatusToggle model={model} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
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
        <CardAction>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
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
                <Button variant="outline" size="sm">
                  <IconSearch stroke={1.5} data-icon="inline-start" />
                  Duyệt catalog
                </Button>
              }
            />
            <AiModelFormDialog
              trigger={
                <Button size="sm">
                  <IconPlus stroke={1.5} data-icon="inline-start" />
                  Thêm model
                </Button>
              }
            />
          </div>
        </CardAction>
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
                <Button size="sm">
                  <IconPlus stroke={1.5} data-icon="inline-start" />
                  Thêm model
                </Button>
              }
            />
          </div>
        ) : (
          <AiModelsTable
            models={models}
            isPending={isPending}
            usageByModelId={usageByModelId}
          />
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
