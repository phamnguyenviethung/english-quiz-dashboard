import { useState } from "react"
import { IconAlertTriangle, IconStack2 } from "@tabler/icons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { MANUAL_REFILL_SCOPE_META } from "../constants.ts"
import type { ManualRefillScope } from "../types.ts"

const SCOPE_ITEMS = Object.fromEntries(
  Object.entries(MANUAL_REFILL_SCOPE_META).map(([value, meta]) => [
    value,
    meta.label,
  ])
)

export function ManualRefillDialog({
  isPending,
  onConfirm,
}: {
  isPending: boolean
  onConfirm: (input: {
    scope: ManualRefillScope
    countPerBucket?: number
  }) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [scope, setScope] = useState<ManualRefillScope>("deficient")
  const [countPerBucket, setCountPerBucket] = useState("")
  const [isAcknowledged, setIsAcknowledged] = useState(false)

  const parsedCount =
    countPerBucket.trim() === "" ? undefined : Number(countPerBucket)
  const isCountInvalid =
    parsedCount !== undefined &&
    (!Number.isInteger(parsedCount) || parsedCount < 1)

  const reset = () => {
    setScope("deficient")
    setCountPerBucket("")
    setIsAcknowledged(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) reset()
  }

  const handleConfirm = () => {
    onConfirm({
      scope,
      ...(parsedCount === undefined ? {} : { countPerBucket: parsedCount }),
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" disabled={isPending}>
            <IconStack2 stroke={1.5} data-icon="inline-start" />
            Refill hàng loạt
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Refill pool hàng loạt</DialogTitle>
          <DialogDescription>
            Chạy sinh câu hỏi cho toàn bộ bucket (mọi topic × trình độ × loại
            quiz). Job chạy nền, theo dõi ở màn Lịch sử cron.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-refill-scope">Phạm vi</Label>
            <Select
              items={SCOPE_ITEMS}
              value={scope}
              onValueChange={(value) => {
                setScope(value ?? "deficient")
                setIsAcknowledged(false)
              }}
            >
              <SelectTrigger id="manual-refill-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MANUAL_REFILL_SCOPE_META).map(
                  ([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {MANUAL_REFILL_SCOPE_META[scope].description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-refill-count">Số câu mỗi bucket</Label>
            <Input
              id="manual-refill-count"
              type="number"
              min={1}
              step={1}
              className="max-w-40 tabular-nums"
              placeholder="Mặc định"
              value={countPerBucket}
              aria-invalid={isCountInvalid}
              onChange={(event) => setCountPerBucket(event.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Bỏ trống để dùng cấu hình mặc định của hệ thống.
            </p>
          </div>

          {scope === "all" ? (
            <Alert variant="destructive">
              <IconAlertTriangle stroke={1.5} />
              <AlertTitle>Tốn chi phí AI đáng kể</AlertTitle>
              <AlertDescription>
                Phạm vi này ép sinh câu mới cho mọi bucket kể cả bucket đã đầy,
                và bỏ qua giới hạn số câu mỗi lần chạy. Với số topic hiện tại,
                đây là hàng nghìn lượt gọi LLM.
              </AlertDescription>
            </Alert>
          ) : null}

          <Label className="flex items-start gap-3 font-normal">
            <Checkbox
              checked={isAcknowledged}
              onCheckedChange={(checked) => setIsAcknowledged(checked === true)}
            />
            <span className="text-sm text-muted-foreground">
              Tôi hiểu thao tác này gọi LLM thật và phát sinh chi phí.
            </span>
          </Label>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Huỷ</DialogClose>
          <Button
            disabled={!isAcknowledged || isCountInvalid || isPending}
            onClick={handleConfirm}
          >
            Chạy refill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
