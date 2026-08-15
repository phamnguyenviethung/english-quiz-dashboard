import { StatusBadge } from "@/components/common/status-badge.tsx"
import { Badge } from "@/components/ui/badge"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
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

import { MODEL_CONTEXT_META, MODEL_STATUS_META } from "../constants.ts"
import type { AiModel } from "../types.ts"
import { countProviderOptions } from "../utils/provider-preferences.ts"
import { AiModelRowActions } from "./ai-model-row-actions.tsx"

function ModelId({ modelId }: { modelId: string }) {
  const { provider, name, suffix } = formatModelName(modelId)

  return (
    <span className="text-foreground">
      {provider ? (
        <span className="text-muted-foreground">{provider}/</span>
      ) : null}
      {name}
      {suffix ? <span className="text-muted-foreground">:{suffix}</span> : null}
    </span>
  )
}

/**
 * Badge cho 3 ngữ cảnh. Mỗi ngữ cảnh một hue riêng khi bật (xem MODEL_CONTEXT_META)
 * để quét danh sách là biết model phục vụ đường nào; tắt thì xám mờ hẳn đi. Kèm số
 * tuỳ chọn provider nếu có cấu hình riêng.
 */
function ContextBadges({ model }: { model: AiModel }) {
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

function Price({ model }: { model: AiModel }) {
  const hasPrice =
    model.pricePromptPerToken !== null || model.priceCompletionPerToken !== null

  // Thiếu giá là việc cần xử lý (bấm đồng bộ) nên tô amber cho nổi, thay vì để
  // chìm trong một rừng dấu gạch.
  if (!hasPrice) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="text-amber-600 dark:text-amber-400">
              Chưa có giá
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
          <span>
            {formatUsdPerMillion(model.pricePromptPerToken)}
            {" / "}
            {formatUsdPerMillion(model.priceCompletionPerToken)}
          </span>
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

export function AiModelItem({
  model,
  usage,
  isSyncing,
  onSyncPricing,
}: {
  model: AiModel
  usage: number | undefined
  isSyncing: boolean
  onSyncPricing: () => void
}) {
  return (
    <Item
      role="listitem"
      variant={model.isActive ? "outline" : "muted"}
      className="items-start"
    >
      <ItemContent>
        <ItemTitle className="flex-wrap gap-2">
          <span
            className={model.isActive ? undefined : "text-muted-foreground"}
          >
            {model.key}
          </span>
          {model.isActive ? null : (
            <StatusBadge meta={MODEL_STATUS_META.inactive} />
          )}
        </ItemTitle>
        {/* ItemDescription mặc định line-clamp-2, model ID dài phải xuống dòng đủ. */}
        <ItemDescription className="line-clamp-none font-mono text-xs break-all">
          <ModelId modelId={model.modelId} />
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <AiModelRowActions
          model={model}
          isSyncing={isSyncing}
          onSyncPricing={onSyncPricing}
        />
      </ItemActions>

      {/* basis-full nên cụm này luôn là dòng riêng; đủ rộng thì giá dạt sang phải. */}
      <ItemFooter className="flex-wrap justify-start gap-x-4 gap-y-2">
        <ContextBadges model={model} />
        <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums @2xl/models:ml-auto">
          <Price model={model} />
          <span aria-hidden>·</span>
          <span>
            {usage === undefined
              ? "chưa dùng"
              : `${formatNumber(usage)} đã sinh`}
          </span>
        </div>
      </ItemFooter>
    </Item>
  )
}

export function AiModelItemSkeleton() {
  return (
    <Item variant="outline" className="items-start">
      <ItemContent className="gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </ItemContent>
      <ItemActions>
        <Skeleton className="size-11 rounded-4xl" />
      </ItemActions>
      <ItemFooter className="justify-start gap-2">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </ItemFooter>
    </Item>
  )
}
