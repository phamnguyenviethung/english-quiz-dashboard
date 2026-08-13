import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { IconAlertTriangle, IconSparkles } from "@tabler/icons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
import { RefillModelPicker } from "@/features/question-pool/components/refill-model-picker.tsx"
import { RefillTopicPicker } from "@/features/question-pool/components/refill-topic-picker.tsx"
import { ENG_LEVELS } from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"
import { formatNumber } from "@/lib/format.ts"

import {
  BUCKET_FILTER_ALL_HINT,
  READING_REFILL_SCOPE_META,
  REFILL_COST_WARNING_PASSAGES,
} from "../constants.ts"
import { useReadingBuckets } from "../hooks/use-reading-buckets.ts"
import { useReadingGenerationModels } from "../hooks/use-reading-models.ts"
import { useReadingRefill } from "../hooks/use-reading-refill.ts"
import type { ReadingRefillScope } from "../types.ts"
import { ReadingBucketList } from "./reading-bucket-list.tsx"

const INITIAL_SCOPE: ReadingRefillScope = "deficient"
const TOUCH_TOGGLE = "min-h-11 lg:min-h-9"

export function ReadingRefillPage() {
  const navigate = useNavigate()

  const [scope, setScope] = useState<ReadingRefillScope>(INITIAL_SCOPE)
  const [countPerBucket, setCountPerBucket] = useState("")
  const [models, setModels] = useState<string[]>([])
  const [cefrLevels, setCefrLevels] = useState<EngLevel[]>([])
  const [topicIds, setTopicIds] = useState<number[]>([])
  // Lưu bucket bị BỎ tick chứ không phải bucket được tick: khi nới bộ lọc, bucket mới
  // về mặc định vẫn được chọn thay vì im lặng bị bỏ sót.
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
  } = useReadingGenerationModels()

  const preview = useReadingBuckets(
    {
      scope,
      cefrLevels,
      topicIds,
      ...(isCountInvalid ? {} : { countPerBucket: parsedCount }),
    },
    true
  )

  const { startRefill, isPending } = useReadingRefill({
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

  const plannedPassages = preview.buckets
    .filter((bucket) => selectedKeys.has(bucket.bucketKey))
    .reduce((sum, bucket) => sum + bucket.plannedCount, 0)

  const hasNoUsableModel = !isModelsPending && availableModels.length === 0
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
      cefrLevels,
      topicIds,
      ...(parsedCount === undefined ? {} : { countPerBucket: parsedCount }),
      // Chọn hết theo bộ lọc thì để API tự quét: payload gọn và không đóng băng
      // danh sách bucket theo ảnh chụp preview.
      ...(isFullSelection ? {} : { bucketKeys: [...selectedKeys] }),
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="flex flex-col divide-y">
        <section className="flex flex-col gap-3 pb-6">
          <SectionTitle
            title="Model sinh bài"
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
              ? "Không tải được danh sách model. Bỏ trống sẽ dùng mọi model đang bật cho reading."
              : "Bỏ trống = mọi model đang bật cho reading."}
          </FieldDescription>
        </section>

        <section className="flex flex-col gap-3 py-6">
          <SectionTitle
            title="Phạm vi & số lượng"
            description="Quyết định mỗi bucket được sinh thêm bao nhiêu bài."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="reading-refill-scope">Phạm vi</FieldLabel>
              <Select
                value={scope}
                disabled={isPending}
                onValueChange={(value) => setScope(value || INITIAL_SCOPE)}
              >
                <SelectTrigger
                  id="reading-refill-scope"
                  className="min-h-11 lg:min-h-9"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(READING_REFILL_SCOPE_META).map(
                    ([value, meta]) => (
                      <SelectItem key={value} value={value}>
                        {meta.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FieldDescription>
                {READING_REFILL_SCOPE_META[scope].description}
              </FieldDescription>
            </Field>

            <Field data-invalid={isCountInvalid || undefined}>
              <FieldLabel htmlFor="reading-refill-count">
                Số bài mỗi bucket
              </FieldLabel>
              <Input
                id="reading-refill-count"
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
              value={cefrLevels}
              disabled={isPending}
              onValueChange={(value) => setCefrLevels(value as EngLevel[])}
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
            title="Bucket sẽ sinh"
            description="Bỏ tick bucket không muốn chạy trong lần này."
          />
          <ReadingBucketList
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
        </section>
      </div>

      <aside className="flex flex-col gap-3 rounded-2xl border p-4 lg:sticky lg:top-20">
        <h2 className="text-base font-semibold tracking-tight">Tóm tắt</h2>

        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Bucket đã chọn</dt>
            <dd className="tabular-nums">{formatNumber(selectedKeys.size)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Số bài sẽ sinh</dt>
            <dd className="tabular-nums">{formatNumber(plannedPassages)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Model</dt>
            <dd className="tabular-nums">
              {models.length === 0 ? "Tất cả" : formatNumber(models.length)}
            </dd>
          </div>
        </dl>

        {plannedPassages >= REFILL_COST_WARNING_PASSAGES ? (
          <Alert>
            <IconAlertTriangle stroke={1.5} />
            <AlertTitle>Lượng bài khá lớn</AlertTitle>
            <AlertDescription>
              {formatNumber(plannedPassages)} bài đọc sẽ tốn đáng kể chi phí
              LLM. Cân nhắc thu hẹp bộ lọc hoặc giảm số bài mỗi bucket.
            </AlertDescription>
          </Alert>
        ) : null}

        {hasNoUsableModel ? (
          <Alert variant="destructive">
            <IconAlertTriangle stroke={1.5} />
            <AlertTitle>Chưa có model nào dùng được</AlertTitle>
            <AlertDescription>
              Cần ít nhất một model đang bật và cho phép sinh reading.
            </AlertDescription>
          </Alert>
        ) : null}

        <Button disabled={isSubmitDisabled} onClick={handleConfirm}>
          <IconSparkles stroke={1.5} data-icon="inline-start" />
          {isPending ? "Đang chạy…" : "Bắt đầu sinh"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Job chạy nền. Sau khi bắt đầu sẽ chuyển sang màn Lịch sử cron để theo
          dõi.
        </p>
      </aside>
    </div>
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
