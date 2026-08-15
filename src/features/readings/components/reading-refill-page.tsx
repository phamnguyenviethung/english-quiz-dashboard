import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  BUCKET_FILTER_ALL_HINT,
  TOUCH_TOGGLE,
} from "@/features/refill/constants.ts"
import { RefillBucketGroups } from "@/features/refill/components/refill-bucket-groups.tsx"
import { RefillModelPicker } from "@/features/refill/components/refill-model-picker.tsx"
import { RefillScopeFields } from "@/features/refill/components/refill-scope-fields.tsx"
import { RefillSection } from "@/features/refill/components/refill-section.tsx"
import {
  CostWarning,
  RefillSummaryBar,
  RefillSummaryRail,
} from "@/features/refill/components/refill-summary.tsx"
import { RefillTopicPicker } from "@/features/refill/components/refill-topic-picker.tsx"
import type {
  RefillBucketView,
  RefillCopy,
  RefillSummaryData,
} from "@/features/refill/types.ts"
import { ENG_LEVELS } from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"

import {
  READING_REFILL_SCOPE_META,
  REFILL_COST_WARNING_PASSAGES,
} from "../constants.ts"
import { useReadingBuckets } from "../hooks/use-reading-buckets.ts"
import { useReadingGenerationModels } from "../hooks/use-reading-models.ts"
import { useReadingRefill } from "../hooks/use-reading-refill.ts"
import type { ReadingRefillScope } from "../types.ts"

const INITIAL_SCOPE: ReadingRefillScope = "deficient"

const COPY: RefillCopy = {
  unit: "bài",
  plannedStatLabel: "Bài sẽ sinh",
  confirmTitle: "Sinh bài đọc?",
  confirmAction: "Bắt đầu sinh",
  wideOpenModelLabel: "mọi model đang bật cho reading",
  costWarningThreshold: REFILL_COST_WARNING_PASSAGES,
}

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

  // Reading chỉ có 1 chiều (cefrLevel) nên không có `variantLabel`.
  const bucketViews = useMemo<RefillBucketView[]>(
    () =>
      preview.buckets.map((bucket) => ({
        bucketKey: bucket.bucketKey,
        topicId: bucket.topicId,
        topicName: bucket.topicName,
        level: bucket.cefrLevel,
        currentCount: bucket.currentCount,
        plannedCount: bucket.plannedCount,
      })),
    [preview.buckets]
  )

  const selectedKeys = useMemo(() => {
    const keys = bucketViews
      .filter(
        (bucket) =>
          bucket.plannedCount > 0 && !deselectedKeys.has(bucket.bucketKey)
      )
      .map((bucket) => bucket.bucketKey)
    return new Set(keys)
  }, [bucketViews, deselectedKeys])

  const plannedPassages = bucketViews
    .filter((bucket) => selectedKeys.has(bucket.bucketKey))
    .reduce((sum, bucket) => sum + bucket.plannedCount, 0)

  const hasNoUsableModel = !isModelsPending && availableModels.length === 0

  const summaryData: RefillSummaryData = {
    selectedBuckets: selectedKeys.size,
    plannedItems: plannedPassages,
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
        : new Set(bucketViews.map((bucket) => bucket.bucketKey))
    )
  }

  const handleConfirm = () => {
    const isFullSelection = bucketViews.every(
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
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex flex-col divide-y">
          <RefillSection
            title="Model sinh bài"
            description="Mỗi bucket chọn ngẫu nhiên một model trong số đã tick."
            className="pb-6"
          >
            <RefillModelPicker
              models={availableModels}
              value={models}
              isPending={isModelsPending}
              disabled={isPending}
              emptyDescription="Sinh bài đọc cần ít nhất một model đang bật và cho phép sinh reading."
              onChange={setModels}
            />
            <FieldDescription>
              {isModelsError
                ? "Không tải được danh sách model. Bỏ trống sẽ dùng mọi model đang bật cho reading."
                : "Bỏ trống = mọi model đang bật cho reading."}
            </FieldDescription>
          </RefillSection>

          <RefillSection
            title="Phạm vi & số lượng"
            description="Quyết định mỗi bucket được sinh thêm bao nhiêu bài."
            className="py-6"
          >
            <RefillScopeFields
              idPrefix="reading-refill"
              scopeMeta={READING_REFILL_SCOPE_META}
              scope={scope}
              countLabel="Số bài mỗi bucket"
              count={countPerBucket}
              isCountInvalid={isCountInvalid}
              disabled={isPending}
              onScopeChange={(value) => setScope(value as ReadingRefillScope)}
              onCountChange={setCountPerBucket}
            />
          </RefillSection>

          <RefillSection
            title="Lọc bucket"
            description="Thu hẹp theo từng chiều. Chiều nào bỏ trống thì không lọc."
            className="gap-5 py-6"
          >
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
          </RefillSection>

          <RefillSection
            title="Bucket sẽ sinh"
            description="Mở một chủ đề để bỏ tick từng bucket cụ thể."
            className="py-6"
          >
            <RefillBucketGroups
              buckets={bucketViews}
              summary={preview.summary}
              copy={COPY}
              selectedKeys={selectedKeys}
              isPending={preview.isPending}
              isStale={preview.isStale || preview.isFetching}
              isError={preview.isError}
              error={preview.error}
              emptyDescription="Nới bộ lọc cấp độ hoặc chủ đề, hoặc kiểm tra xem đã có chủ đề nào đang bật chưa."
              onRetry={() => void preview.refetch()}
              onToggleBuckets={toggleBuckets}
              onToggleAll={toggleAllBuckets}
            />
            <div className="lg:hidden">
              <CostWarning plannedItems={plannedPassages} copy={COPY} />
            </div>
          </RefillSection>
        </div>

        <RefillSummaryRail
          data={summaryData}
          copy={COPY}
          isPending={isPending}
          disabled={isSubmitDisabled}
          onConfirm={handleConfirm}
        />
      </div>

      <RefillSummaryBar
        data={summaryData}
        copy={COPY}
        isPending={isPending}
        disabled={isSubmitDisabled}
        onConfirm={handleConfirm}
      />
    </>
  )
}
