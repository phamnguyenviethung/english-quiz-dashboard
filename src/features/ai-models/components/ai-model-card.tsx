import { useState } from "react"
import {
  IconBook,
  IconCheck,
  IconClockBolt,
  IconCopy,
  IconHandClick,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { formatModelName } from "@/features/quiz/constants.ts"
import { copyText } from "@/lib/clipboard.ts"
import { formatNumber, formatUsdPerMillion } from "@/lib/format.ts"
import { cn } from "@/lib/utils"

import type { AiModel } from "../types.ts"
import { countProviderOptions } from "../utils/provider-preferences.ts"
import { AiModelRowActions } from "./ai-model-row-actions.tsx"

interface AiModelCardProps {
  model: AiModel
  usage: number | undefined
  isSyncing: boolean
  onSyncPricing: () => void
}

export function AiModelCard({
  model,
  usage,
  isSyncing,
  onSyncPricing,
}: AiModelCardProps) {
  const [copied, setCopied] = useState(false)
  const { provider, name, suffix } = formatModelName(model.modelId)

  const handleCopyId = async (e: React.MouseEvent) => {
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

  const scheduleOptions = countProviderOptions(model.scheduleProvider)
  const manualOptions = countProviderOptions(model.manualProvider)
  const readingOptions = countProviderOptions(model.readingProvider)

  const hasAnyContext =
    model.scheduleEnabled || model.manualEnabled || model.readingEnabled

  const hasPrice =
    model.pricePromptPerToken !== null || model.priceCompletionPerToken !== null

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-2xs transition-all",
        !model.isActive && "opacity-80"
      )}
    >
      {/* Top row: Model key + Provider & Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "truncate text-base font-semibold tracking-tight",
                !model.isActive && "text-muted-foreground"
              )}
            >
              {model.key}
            </span>
            {provider ? (
              <span className="shrink-0 rounded-md bg-muted/70 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {provider}
              </span>
            ) : null}
          </div>

          {/* Model ID with one-tap copy button */}
          <button
            type="button"
            onClick={handleCopyId}
            className="group flex max-w-full items-center gap-1.5 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
            title="Bấm để sao chép Model ID"
          >
            <span className="truncate font-mono">
              {provider ? `${provider}/` : ""}
              {name}
              {suffix ? `:${suffix}` : ""}
            </span>
            {copied ? (
              <IconCheck className="size-3 shrink-0 text-emerald-500" />
            ) : (
              <IconCopy className="size-3 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
            )}
          </button>
        </div>

        {/* Status indicator & Actions Menu */}
        <div className="flex shrink-0 items-center gap-1.5">
          {model.isActive ? (
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 text-[11px] font-normal text-emerald-700 dark:text-emerald-400"
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Bật
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 px-2 py-0.5 text-[11px] font-normal text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              Tắt
            </Badge>
          )}

          <AiModelRowActions
            model={model}
            isSyncing={isSyncing}
            onSyncPricing={onSyncPricing}
          />
        </div>
      </div>

      {/* Context Chips (only enabled ones shown) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {model.scheduleEnabled ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            <IconClockBolt className="size-3 text-muted-foreground" />
            Tự động
            {scheduleOptions > 0 ? (
              <span className="font-mono text-muted-foreground">
                · {scheduleOptions}
              </span>
            ) : null}
          </span>
        ) : null}

        {model.manualEnabled ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            <IconHandClick className="size-3 text-muted-foreground" />
            Thủ công
            {manualOptions > 0 ? (
              <span className="font-mono text-muted-foreground">
                · {manualOptions}
              </span>
            ) : null}
          </span>
        ) : null}

        {model.readingEnabled ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            <IconBook className="size-3 text-muted-foreground" />
            Bài đọc
            {readingOptions > 0 ? (
              <span className="font-mono text-muted-foreground">
                · {readingOptions}
              </span>
            ) : null}
          </span>
        ) : null}

        {!hasAnyContext ? (
          <span className="text-xs text-amber-600 italic dark:text-amber-400">
            Chưa gán ngữ cảnh
          </span>
        ) : null}
      </div>

      {/* Footer Info: Pricing and Usage */}
      <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs">
        <div className="flex items-center gap-1.5 tabular-nums">
          <span className="text-muted-foreground">Giá /1M:</span>
          {hasPrice ? (
            <span className="font-medium text-foreground">
              ${formatUsdPerMillion(model.pricePromptPerToken)} / $
              {formatUsdPerMillion(model.priceCompletionPerToken)}
            </span>
          ) : (
            <button
              type="button"
              onClick={onSyncPricing}
              disabled={isSyncing}
              className="text-amber-600 hover:underline dark:text-amber-400"
            >
              Chưa có giá · Đồng bộ ngay
            </button>
          )}
        </div>

        <div className="text-muted-foreground tabular-nums">
          {usage === undefined ? (
            "Chưa sinh"
          ) : (
            <span>
              <strong className="font-medium text-foreground">
                {formatNumber(usage)}
              </strong>{" "}
              câu hỏi
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
