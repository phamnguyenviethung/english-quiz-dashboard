import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ENG_LEVELS,
  QUIZ_TYPES,
  getQuizTypeLabel,
} from "@/features/quiz/constants.ts"
import type { EngLevel, QuizType } from "@/features/quiz/types.ts"

import {
  BUCKET_FILTER_ALL_HINT,
  MANUAL_REFILL_SCOPE_META,
} from "../constants.ts"
import { useManualRefill } from "../hooks/use-manual-refill.ts"
import { useManualRefillModels } from "../hooks/use-manual-refill-models.ts"
import { usePoolBuckets } from "../hooks/use-pool-buckets.ts"
import type { ManualRefillScope } from "../types.ts"
import { RefillBucketGroups } from "./refill-bucket-groups.tsx"
import { RefillModelPicker } from "./refill-model-picker.tsx"
import {
  CostWarning,
  RefillSummaryBar,
  RefillSummaryRail,
} from "./refill-summary.tsx"
import type { RefillSummaryData } from "./refill-summary.tsx"
import { RefillTopicPicker } from "./refill-topic-picker.tsx"

const INITIAL_SCOPE: ManualRefillScope = "deficient"

/** Toggle phải đủ lớn để chạm trên điện thoại, desktop thì về cỡ thường. */
const TOUCH_TOGGLE = "min-h-11 lg:min-h-9"

const SCOPE_ITEMS = Object.fromEntries(
  Object.entries(MANUAL_REFILL_SCOPE_META).map(([value, meta]) => [
    value,
    meta.label,
  ])
)

export function ManualRefillPage() {
  const navigate = useNavigate()

  const [scope, setScope] = useState<ManualRefillScope>(INITIAL_SCOPE)
  const [countPerBucket, setCountPerBucket] = useState("")
  const [models, setModels] = useState<string[]>([])
  const [engLevels, setEngLevels] = useState<EngLevel[]>([])
  const [quizTypes, setQuizTypes] = useState<QuizType[]>([])
  const [topicIds, setTopicIds] = useState<number[]>([])
  // Lưu bucket bị BỎ tick, không phải bucket được tick: khi nới bộ lọc và danh sách
  // bucket mới về, bucket mới mặc định vẫn được chọn thay vì im lặng bị bỏ sót.
  const [deselectedKeys, setDeselectedKeys] = useState<Set<string>>(new Set())

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
    true
  )

  const { startRefill, isPending } = useManualRefill({
    onStarted: (runId) => {
      void navigate(
        runId ? { to: "/cron-runs", search: { runId } } : { to: "/cron-runs" }
      )
    },
  })

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

  const summaryData: RefillSummaryData = {
    selectedBuckets: selectedKeys.size,
    plannedQuestions,
    modelCount: models.length,
    isModelPoolWideOpen: models.length === 0,
  }

  const isSubmitDisabled =
    isPending || isCountInvalid || hasNoUsableModel || selectedKeys.size === 0

  const toggleBuckets = (bucketKeys: string[], checked: boolean) => {
    setDeselectedKeys((current) => {
      const next = new Set(current)
      for (const key of bucketKeys) {
        if (checked) next.delete(key)
        else next.add(key)
      }
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
      (bucket) =>
        bucket.plannedCount === 0 || selectedKeys.has(bucket.bucketKey)
    )

    startRefill({
      scope,
      models,
      engLevels,
      quizTypes,
      topicIds,
      ...(parsedCount === undefined ? {} : { countPerBucket: parsedCount }),
      // Chọn hết theo bộ lọc thì để API tự quét: payload gọn và không đóng băng
      // danh sách bucket theo ảnh chụp preview.
      ...(isFullSelection ? {} : { bucketKeys: [...selectedKeys] }),
    })
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex flex-col divide-y">
          <section className="flex flex-col gap-3 pb-6">
            <SectionTitle
              title="Model sinh câu"
              description="Mỗi bucket chọn ngẫu nhiên một model trong số đã tick."
            />
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
                : "Bỏ trống = mọi model đang bật chạy thủ công."}
            </FieldDescription>
          </section>

          <section className="flex flex-col gap-3 py-6">
            <SectionTitle
              title="Phạm vi & số lượng"
              description="Quyết định mỗi bucket được sinh thêm bao nhiêu câu."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="refill-scope">Phạm vi</FieldLabel>
                <Select
                  items={SCOPE_ITEMS}
                  value={scope}
                  disabled={isPending}
                  onValueChange={(value) => setScope(value ?? INITIAL_SCOPE)}
                >
                  <SelectTrigger
                    id="refill-scope"
                    className="min-h-11 lg:min-h-9"
                  >
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
                <FieldLabel htmlFor="refill-count">
                  Số câu mỗi bucket
                </FieldLabel>
                <Input
                  id="refill-count"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  className="min-h-11 tabular-nums lg:min-h-9"
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
          </section>

          <section className="flex flex-col gap-5 py-6">
            <SectionTitle
              title="Lọc bucket"
              description="Thu hẹp theo từng chiều. Chiều nào bỏ trống thì không lọc."
            />

            <Field>
              <FieldLabel>Cấp độ</FieldLabel>
              <ToggleGroup
                variant="outline"
                multiple
                className="flex-wrap"
                value={engLevels}
                disabled={isPending}
                onValueChange={(value) => setEngLevels(value as EngLevel[])}
              >
                {ENG_LEVELS.map((level) => (
                  <ToggleGroupItem
                    key={level}
                    value={level}
                    className={TOUCH_TOGGLE}
                  >
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
                multiple
                className="flex-wrap"
                value={quizTypes}
                disabled={isPending}
                onValueChange={(value) => setQuizTypes(value as QuizType[])}
              >
                {QUIZ_TYPES.map((quizType) => (
                  <ToggleGroupItem
                    key={quizType}
                    value={quizType}
                    className={TOUCH_TOGGLE}
                  >
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
          </section>

          <section className="flex flex-col gap-3 py-6">
            <SectionTitle
              title="Bucket sẽ refill"
              description="Mở một chủ đề để bỏ tick từng bucket cụ thể."
            />
            <RefillBucketGroups
              buckets={preview.buckets}
              summary={preview.summary}
              selectedKeys={selectedKeys}
              isPending={preview.isPending}
              isStale={preview.isStale || preview.isFetching}
              isError={preview.isError}
              error={preview.error}
              onRetry={() => void preview.refetch()}
              onToggleBuckets={toggleBuckets}
              onToggleAll={toggleAllBuckets}
            />
            {/* Cảnh báo chi phí nằm cạnh nút chạy ở rail desktop, còn ở mobile thanh
              đáy quá hẹp nên đặt ngay cuối danh sách. */}
            <div className="lg:hidden">
              <CostWarning plannedQuestions={plannedQuestions} />
            </div>
          </section>
        </div>

        <RefillSummaryRail
          data={summaryData}
          isPending={isPending}
          disabled={isSubmitDisabled}
          onConfirm={handleConfirm}
        />
      </div>

      {/* Nằm NGOÀI grid: `sticky bottom-0` bám theo containing block, mà grid area
          của một ô chỉ cao bằng chính nó nên đặt trong grid sẽ không dính được.
          Là con cuối của <main> (cao hơn viewport) thì mới có khoảng để nổi lên. */}
      <RefillSummaryBar
        data={summaryData}
        isPending={isPending}
        disabled={isSubmitDisabled}
        onConfirm={handleConfirm}
      />
    </>
  )
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
