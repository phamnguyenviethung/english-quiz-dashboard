import { useMemo, useState } from "react"
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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ENG_LEVELS,
  QUIZ_TYPES,
  getQuizTypeLabel,
} from "@/features/quiz/constants.ts"
import type { EngLevel, QuizType } from "@/features/quiz/types.ts"
import { formatNumber } from "@/lib/format.ts"

import {
  BUCKET_FILTER_ALL_HINT,
  MANUAL_REFILL_SCOPE_META,
  REFILL_COST_WARNING_QUESTIONS,
} from "../constants.ts"
import { useManualRefillModels } from "../hooks/use-manual-refill-models.ts"
import { usePoolBuckets } from "../hooks/use-pool-buckets.ts"
import type { ManualRefillInput, ManualRefillScope } from "../types.ts"
import { RefillBucketPreview } from "./refill-bucket-preview.tsx"
import { RefillModelPicker } from "./refill-model-picker.tsx"
import { RefillTopicPicker } from "./refill-topic-picker.tsx"

const SCOPE_ITEMS = Object.fromEntries(
  Object.entries(MANUAL_REFILL_SCOPE_META).map(([value, meta]) => [
    value,
    meta.label,
  ])
)

const INITIAL_SCOPE: ManualRefillScope = "deficient"

export function ManualRefillDialog({
  isPending,
  onConfirm,
}: {
  isPending: boolean
  onConfirm: (input: ManualRefillInput) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [scope, setScope] = useState<ManualRefillScope>(INITIAL_SCOPE)
  const [countPerBucket, setCountPerBucket] = useState("")
  const [models, setModels] = useState<string[]>([])
  const [engLevels, setEngLevels] = useState<EngLevel[]>([])
  const [quizTypes, setQuizTypes] = useState<QuizType[]>([])
  const [topicIds, setTopicIds] = useState<number[]>([])
  // Lưu bucket bị BỎ tick, không phải bucket được tick: khi đổi filter và danh sách
  // bucket mới về, bucket mới mặc định vẫn được chọn thay vì im lặng bị bỏ sót.
  const [deselectedKeys, setDeselectedKeys] = useState<Set<string>>(new Set())
  const [isAcknowledged, setIsAcknowledged] = useState(false)

  const parsedCount =
    countPerBucket.trim() === "" ? undefined : Number(countPerBucket)
  const isCountInvalid =
    parsedCount !== undefined &&
    (!Number.isInteger(parsedCount) || parsedCount < 1)

  const {
    models: availableModels,
    isPending: isModelsPending,
    isError: isModelsError,
  } = useManualRefillModels()

  const preview = usePoolBuckets(
    {
      scope,
      engLevels,
      quizTypes,
      topicIds,
      ...(isCountInvalid ? {} : { countPerBucket: parsedCount }),
    },
    isOpen
  )

  const selectedKeys = useMemo(() => {
    const keys = preview.buckets
      .filter(
        (bucket) =>
          bucket.plannedCount > 0 && !deselectedKeys.has(bucket.bucketKey)
      )
      .map((bucket) => bucket.bucketKey)
    return new Set(keys)
  }, [preview.buckets, deselectedKeys])

  const plannedQuestions = preview.buckets
    .filter((bucket) => selectedKeys.has(bucket.bucketKey))
    .reduce((sum, bucket) => sum + bucket.plannedCount, 0)

  const hasNoUsableModel = !isModelsPending && availableModels.length === 0
  const canSubmit =
    isAcknowledged &&
    !isCountInvalid &&
    !isPending &&
    !hasNoUsableModel &&
    selectedKeys.size > 0

  const reset = () => {
    setScope(INITIAL_SCOPE)
    setCountPerBucket("")
    setModels([])
    setEngLevels([])
    setQuizTypes([])
    setTopicIds([])
    setDeselectedKeys(new Set())
    setIsAcknowledged(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) reset()
  }

  const toggleBucket = (bucketKey: string, checked: boolean) => {
    setDeselectedKeys((current) => {
      const next = new Set(current)
      if (checked) next.delete(bucketKey)
      else next.add(bucketKey)
      return next
    })
  }

  const toggleAllBuckets = (checked: boolean) => {
    setDeselectedKeys(
      checked
        ? new Set()
        : new Set(preview.buckets.map((bucket) => bucket.bucketKey))
    )
  }

  const handleConfirm = () => {
    const isFullSelection = preview.buckets.every(
      (bucket) => bucket.plannedCount === 0 || selectedKeys.has(bucket.bucketKey)
    )

    onConfirm({
      scope,
      models,
      engLevels,
      quizTypes,
      topicIds,
      ...(parsedCount === undefined ? {} : { countPerBucket: parsedCount }),
      // Chọn hết theo filter → để API tự quét, payload gọn và không đóng băng
      // danh sách bucket theo ảnh chụp preview.
      ...(isFullSelection ? {} : { bucketKeys: [...selectedKeys] }),
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Refill pool hàng loạt</DialogTitle>
          <DialogDescription>
            Chọn model và phạm vi bucket cần sinh thêm câu. Job chạy nền, theo
            dõi ở màn Lịch sử cron.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-6 max-h-[65vh] divide-y overflow-y-auto px-6">
          <div className="flex flex-col gap-5 pb-5">
            <Field>
              <FieldLabel>Model sinh câu</FieldLabel>
              <RefillModelPicker
                models={availableModels}
                value={models}
                isPending={isModelsPending}
                disabled={isPending}
                onChange={setModels}
              />
              <FieldDescription>
                {isModelsError
                  ? "Không tải được danh sách model. Bỏ trống sẽ dùng mọi model đang bật chạy thủ công."
                  : "Mỗi bucket chọn ngẫu nhiên một model trong số đã tick. Bỏ trống = mọi model đang bật chạy thủ công."}
              </FieldDescription>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="manual-refill-scope">Phạm vi</FieldLabel>
                <Select
                  items={SCOPE_ITEMS}
                  value={scope}
                  disabled={isPending}
                  onValueChange={(value) => {
                    setScope(value ?? INITIAL_SCOPE)
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
                <FieldDescription>
                  {MANUAL_REFILL_SCOPE_META[scope].description}
                </FieldDescription>
              </Field>

              <Field data-invalid={isCountInvalid || undefined}>
                <FieldLabel htmlFor="manual-refill-count">
                  Số câu mỗi bucket
                </FieldLabel>
                <Input
                  id="manual-refill-count"
                  type="number"
                  min={1}
                  step={1}
                  className="max-w-40 tabular-nums"
                  placeholder="Mặc định"
                  value={countPerBucket}
                  disabled={isPending}
                  aria-invalid={isCountInvalid}
                  onChange={(event) => setCountPerBucket(event.target.value)}
                />
                <FieldDescription>
                  {isCountInvalid
                    ? "Nhập số nguyên từ 1 trở lên."
                    : "Bỏ trống để dùng cấu hình mặc định của hệ thống."}
                </FieldDescription>
              </Field>
            </div>

            <Field>
              <FieldLabel>Cấp độ</FieldLabel>
              <ToggleGroup
                variant="outline"
                size="sm"
                multiple
                value={engLevels}
                disabled={isPending}
                onValueChange={(value) => setEngLevels(value as EngLevel[])}
              >
                {ENG_LEVELS.map((level) => (
                  <ToggleGroupItem key={level} value={level}>
                    {level}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FieldDescription>{BUCKET_FILTER_ALL_HINT}</FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Loại quiz</FieldLabel>
              <ToggleGroup
                variant="outline"
                size="sm"
                multiple
                className="flex-wrap"
                value={quizTypes}
                disabled={isPending}
                onValueChange={(value) => setQuizTypes(value as QuizType[])}
              >
                {QUIZ_TYPES.map((quizType) => (
                  <ToggleGroupItem key={quizType} value={quizType}>
                    {getQuizTypeLabel(quizType)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FieldDescription>{BUCKET_FILTER_ALL_HINT}</FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Chủ đề</FieldLabel>
              <RefillTopicPicker
                value={topicIds}
                disabled={isPending}
                onChange={setTopicIds}
              />
              <FieldDescription>{BUCKET_FILTER_ALL_HINT}</FieldDescription>
            </Field>
          </div>

          <div className="flex flex-col gap-4 py-5">
            <RefillBucketPreview
              buckets={preview.buckets}
              summary={preview.summary}
              selectedKeys={selectedKeys}
              isPending={preview.isPending}
              isStale={preview.isStale || preview.isFetching}
              isError={preview.isError}
              error={preview.error}
              onRetry={() => void preview.refetch()}
              onToggle={toggleBucket}
              onToggleAll={toggleAllBuckets}
            />

            {plannedQuestions > REFILL_COST_WARNING_QUESTIONS ? (
              <Alert variant="destructive">
                <IconAlertTriangle stroke={1.5} />
                <AlertTitle>Tốn chi phí AI đáng kể</AlertTitle>
                <AlertDescription>
                  Lần chạy này sinh khoảng {formatNumber(plannedQuestions)} câu,
                  tương ứng chừng đó lượt gọi LLM và không bị giới hạn chi phí
                  mỗi lần chạy. Thu hẹp bộ lọc nếu chỉ muốn thử.
                </AlertDescription>
              </Alert>
            ) : null}

            <Label className="flex items-start gap-3 font-normal">
              <Checkbox
                checked={isAcknowledged}
                disabled={isPending}
                onCheckedChange={(checked) =>
                  setIsAcknowledged(checked === true)
                }
              />
              <span className="text-sm text-muted-foreground">
                Tôi hiểu thao tác này gọi LLM thật và phát sinh chi phí.
              </span>
            </Label>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" type="button" />}>
            Huỷ
          </DialogClose>
          <Button disabled={!canSubmit} onClick={handleConfirm}>
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Chạy refill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
