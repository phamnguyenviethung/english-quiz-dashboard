import { IconCpu, IconPencil, IconPlus } from "@tabler/icons-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatModelName } from "@/features/quiz/constants.ts"
import { formatNumber } from "@/lib/format.ts"

import { MODEL_STATUS_META } from "../constants.ts"
import { useAiModels } from "../hooks/use-ai-models.ts"
import { usePoolModelUsage } from "../hooks/use-pool-model-usage.ts"
import type { AiModel } from "../types.ts"
import { AiModelFormDialog } from "./ai-model-form-dialog.tsx"
import { AiModelStatusToggle } from "./ai-model-status-toggle.tsx"

const COLUMN_COUNT = 5

const CREATE_TRIGGER = (
  <Button size="sm">
    <IconPlus stroke={1.5} data-icon="inline-start" />
    Thêm model
  </Button>
)

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

function AiModelsTable({
  models,
  isPending,
  usageByModelId,
}: {
  models: AiModel[]
  isPending: boolean
  usageByModelId: Map<string, number>
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Model ID</TableHead>
            <TableHead className="w-32">Trạng thái</TableHead>
            <TableHead className="w-24 text-right">Đã sinh</TableHead>
            <TableHead className="w-40" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows columns={COLUMN_COUNT} />
          ) : (
            models.map((model) => {
              const status = MODEL_STATUS_META[model.isActive ? "active" : "inactive"]
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
                  <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                    {usage === undefined ? "-" : formatNumber(usage)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <AiModelFormDialog
                        model={model}
                        trigger={
                          <Button variant="outline" size="icon-sm">
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

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconCpu className="size-4 text-muted-foreground" stroke={1.5} />
          <CardTitle>AI Model</CardTitle>
        </div>
        <CardDescription>
          Model OpenRouter đang bật được chọn ngẫu nhiên khi sinh câu hỏi. Tắt
          một model để loại nó khỏi vòng chọn mà không mất lịch sử.
        </CardDescription>
        <CardAction>
          <AiModelFormDialog trigger={CREATE_TRIGGER} />
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
            <AiModelFormDialog trigger={CREATE_TRIGGER} />
          </div>
        ) : (
          <AiModelsTable
            models={models}
            isPending={isPending}
            usageByModelId={usageByModelId}
          />
        )}
      </CardContent>
    </Card>
  )
}
