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
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ItemGroup, ItemSeparator } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

import { useAiModels } from "../hooks/use-ai-models.ts"
import { usePoolModelUsage } from "../hooks/use-pool-model-usage.ts"
import {
  useSyncAllModelsPricing,
  useSyncModelPricing,
} from "../hooks/use-sync-model-pricing.ts"
import type { AiModel } from "../types.ts"
import { AiModelFormDialog } from "./ai-model-form-dialog.tsx"
import { AiModelItem, AiModelItemSkeleton } from "./ai-model-item.tsx"
import { ModelCatalogDialog } from "./model-catalog-dialog.tsx"

const SKELETON_COUNT = 4

/**
 * Danh sách record chứ không phải bảng: mỗi model có 7 thuộc tính nhưng chỉ vài
 * chục model, không sort không lọc, nên ép vào số cột cố định là nguồn gốc của mọi
 * hack responsive. `@container/models` cho Item tự bố cục theo bề rộng panel — thu
 * sidebar đổi bề rộng khoảng 256px mà viewport không đổi.
 */
function AiModelsList({
  models,
  isPending,
  usageByModelId,
}: {
  models: AiModel[]
  isPending: boolean
  usageByModelId: Map<string, number>
}) {
  const { syncModelPricing, pendingId } = useSyncModelPricing()

  // Chỉ phân nhóm, giữ nguyên thứ tự theo modelId mà useAiModels đã sắp.
  const { active, inactive } = useMemo(
    () => ({
      active: models.filter((model) => model.isActive),
      inactive: models.filter((model) => !model.isActive),
    }),
    [models]
  )

  if (isPending) {
    return (
      <div className="@container/models">
        <ItemGroup>
          {Array.from({ length: SKELETON_COUNT }, (_item, index) => (
            <AiModelItemSkeleton key={index} />
          ))}
        </ItemGroup>
      </div>
    )
  }

  const renderItem = (model: AiModel) => (
    <AiModelItem
      key={model.id}
      model={model}
      usage={usageByModelId.get(model.modelId)}
      isSyncing={pendingId === model.id}
      onSyncPricing={() => void syncModelPricing(model.id)}
    />
  )

  return (
    <div className="@container/models">
      {active.length > 0 ? (
        <ItemGroup>{active.map(renderItem)}</ItemGroup>
      ) : null}

      {/* Không còn cột Trạng thái để quét, nên gom model đã tắt xuống một nhóm riêng. */}
      {inactive.length > 0 ? (
        <>
          <ItemSeparator className="my-4" />
          <p className="mb-3 text-xs text-muted-foreground">
            Đã tắt ({inactive.length})
          </p>
          <ItemGroup>{inactive.map(renderItem)}</ItemGroup>
        </>
      ) : null}
    </div>
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
      {/*
        CardHeader ép grid-cols-[1fr_auto] khi có CardAction nên ở điện thoại ba
        nút bị nhồi vào cột phải hẹp. Dưới sm cho nó rơi hẳn xuống hàng riêng.
      */}
      <CardHeader className="max-sm:grid-cols-1">
        <div className="flex items-center gap-2">
          <IconCpu className="size-4 text-muted-foreground" stroke={1.5} />
          <CardTitle>Danh sách model</CardTitle>
        </div>
        <CardDescription>
          Model được chọn ngẫu nhiên trong số các model đang bật của từng ngữ
          cảnh. Tắt một model để loại nó khỏi vòng chọn mà không mất lịch sử.
        </CardDescription>
        <CardAction className="max-sm:col-start-1 max-sm:row-start-3 max-sm:mt-2 max-sm:justify-self-stretch">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <AiModelFormDialog
              trigger={
                <Button size="sm" className="col-span-2 h-11 sm:order-3 sm:h-8">
                  <IconPlus stroke={1.5} data-icon="inline-start" />
                  Thêm model
                </Button>
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="h-11 sm:order-1 sm:h-8"
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
                  size="sm"
                  className="h-11 sm:order-2 sm:h-8"
                >
                  <IconSearch stroke={1.5} data-icon="inline-start" />
                  Duyệt catalog
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
            <AiModelsList
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
