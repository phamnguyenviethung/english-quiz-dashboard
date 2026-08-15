import { IconAlertTriangle, IconPlayerPlay } from "@tabler/icons-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { formatNumber } from "@/lib/format.ts"
import { cn } from "@/lib/utils"

import type { RefillCopy, RefillSummaryData } from "../types.ts"

function ConfirmButton({
  data,
  copy,
  isPending,
  disabled,
  className,
  size,
  onConfirm,
}: {
  data: RefillSummaryData
  copy: RefillCopy
  isPending: boolean
  disabled: boolean
  className?: string
  size?: "default" | "lg"
  onConfirm: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button disabled={disabled} size={size} className={className}>
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <IconPlayerPlay stroke={1.5} data-icon="inline-start" />
            )}
            {copy.confirmAction}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            Sẽ sinh khoảng {formatNumber(data.plannedItems)} {copy.unit} cho{" "}
            {formatNumber(data.selectedBuckets)} bucket, dùng{" "}
            {data.isModelPoolWideOpen
              ? copy.wideOpenModelLabel
              : `${formatNumber(data.modelCount)} model đã chọn`}
            . Thao tác gọi LLM thật và phát sinh chi phí, không huỷ được giữa
            chừng.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Huỷ</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {copy.confirmAction}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CostWarning({
  plannedItems,
  copy,
}: {
  plannedItems: number
  copy: RefillCopy
}) {
  if (plannedItems <= copy.costWarningThreshold) return null

  return (
    <Alert variant="destructive">
      <IconAlertTriangle stroke={1.5} />
      <AlertTitle>Tốn chi phí AI đáng kể</AlertTitle>
      <AlertDescription>
        Lần chạy này sinh khoảng {formatNumber(plannedItems)} {copy.unit}, tương
        ứng chừng đó lượt gọi LLM. Thu hẹp bộ lọc nếu chỉ muốn thử.
      </AlertDescription>
    </Alert>
  )
}

/**
 * Cột tóm tắt dính bên phải ở desktop. Cùng dữ liệu với thanh đáy mobile bên dưới,
 * hai bản ẩn/hiện bằng CSS chứ không rẽ nhánh bằng useIsMobile — hook đó trả false
 * ở render đầu nên sẽ nháy layout lúc hydrate.
 */
export function RefillSummaryRail({
  data,
  copy,
  isPending,
  disabled,
  onConfirm,
}: {
  data: RefillSummaryData
  copy: RefillCopy
  isPending: boolean
  disabled: boolean
  onConfirm: () => void
}) {
  return (
    <aside className="hidden lg:sticky lg:top-20 lg:flex lg:flex-col lg:gap-4">
      <div className="flex flex-col gap-4 rounded-2xl border p-4">
        <div className="grid gap-3">
          <SummaryStat
            label="Bucket đã chọn"
            value={formatNumber(data.selectedBuckets)}
          />
          <SummaryStat
            label={copy.plannedStatLabel}
            value={formatNumber(data.plannedItems)}
            emphasis
          />
          <SummaryStat
            label="Model"
            value={
              data.isModelPoolWideOpen
                ? "Tất cả"
                : formatNumber(data.modelCount)
            }
          />
        </div>

        <ConfirmButton
          data={data}
          copy={copy}
          isPending={isPending}
          disabled={disabled}
          size="lg"
          className="w-full"
          onConfirm={onConfirm}
        />
      </div>

      <CostWarning plannedItems={data.plannedItems} copy={copy} />
    </aside>
  )
}

function SummaryStat({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "tabular-nums",
          emphasis ? "text-2xl font-semibold" : "text-base font-medium"
        )}
      >
        {value}
      </span>
    </div>
  )
}

/**
 * Thanh hành động dính đáy cho tablet và điện thoại. Dùng `sticky` chứ không `fixed`
 * để thanh nằm trong luồng tài liệu, không giật theo thanh địa chỉ co giãn của Safari.
 * `env(safe-area-inset-bottom)` hôm nay bằng 0 (chưa bật viewport-fit=cover) nhưng
 * viết sẵn để đúng ngay nếu sau này chạy ở chế độ PWA standalone.
 */
export function RefillSummaryBar({
  data,
  copy,
  isPending,
  disabled,
  onConfirm,
}: {
  data: RefillSummaryData
  copy: RefillCopy
  isPending: boolean
  disabled: boolean
  onConfirm: () => void
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 -mb-4 border-t bg-background/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:-mx-6 md:-mb-6 md:px-6 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm tabular-nums">
          <span className="font-semibold">
            {formatNumber(data.selectedBuckets)}
          </span>{" "}
          bucket
          <span className="text-muted-foreground">
            {" · "}
            {formatNumber(data.plannedItems)} {copy.unit}
          </span>
        </p>
        <ConfirmButton
          data={data}
          copy={copy}
          isPending={isPending}
          disabled={disabled}
          size="lg"
          className="min-h-12 flex-1 sm:flex-initial sm:px-8"
          onConfirm={onConfirm}
        />
      </div>
    </div>
  )
}

export { CostWarning }
