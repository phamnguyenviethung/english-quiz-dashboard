import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { AudienceToggle } from "@/features/beginner/components/audience-toggle.tsx"
import {
  BEGINNER_LEVELS,
  toBucketAudience,
} from "@/features/beginner/constants.ts"
import type { AudienceValue } from "@/features/beginner/constants.ts"
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
import {
  ENG_LEVELS,
  QUIZ_TYPES,
  getQuizTypeLabel,
} from "@/features/quiz/constants.ts"
import type { EngLevel, QuizType } from "@/features/quiz/types.ts"

import {
  MANUAL_REFILL_SCOPE_META,
  REFILL_COST_WARNING_QUESTIONS,
} from "../constants.ts"
import { useManualRefill } from "../hooks/use-manual-refill.ts"
import { useManualRefillModels } from "../hooks/use-manual-refill-models.ts"
import { usePoolBuckets } from "../hooks/use-pool-buckets.ts"
import type { ManualRefillScope } from "../types.ts"

const INITIAL_SCOPE: ManualRefillScope = "deficient"

const COPY: RefillCopy = {
  unit: "câu",
  plannedStatLabel: "Câu sẽ sinh",
  confirmTitle: "Chạy refill?",
  confirmAction: "Chạy refill",
  wideOpenModelLabel: "mọi model đang bật chạy thủ công",
  costWarningThreshold: REFILL_COST_WARNING_QUESTIONS,
}

export function ManualRefillPage({
  initialAudience = "all",
  initialTopicIds = [],
}: {
  initialAudience?: AudienceValue
  initialTopicIds?: number[]
} = {}) {
  const navigate = useNavigate()

  const [scope, setScope] = useState<ManualRefillScope>(INITIAL_SCOPE)
  const [countPerBucket, setCountPerBucket] = useState("")
  const [models, setModels] = useState<string[]>([])
  const [engLevels, setEngLevels] = useState<EngLevel[]>([])
  const [quizTypes, setQuizTypes] = useState<QuizType[]>([])
  const [topicIds, setTopicIds] = useState<number[]>(initialTopicIds)
  const [audience, setAudience] = useState<AudienceValue>(initialAudience)

  // Beginner không có B2 — bỏ B2 khỏi bộ lọc để preview không lặng lẽ rỗng.
  const changeAudience = (value: AudienceValue) => {
    setAudience(value)
    if (value === "beginner") {
      setEngLevels((current) =>
        current.filter((level) => BEGINNER_LEVELS.includes(level))
      )
    }
  }
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
      audience: toBucketAudience(audience),
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

  const bucketViews = useMemo<RefillBucketView[]>(
    () =>
      preview.buckets.map((bucket) => ({
        bucketKey: bucket.bucketKey,
        topicId: bucket.topicId,
        topicName: bucket.topicName,
        level: bucket.engLevel,
        currentCount: bucket.currentCount,
        plannedCount: bucket.plannedCount,
        variantLabel: getQuizTypeLabel(bucket.quizType),
        forBeginner: bucket.forBeginner,
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

  const plannedQuestions = bucketViews
    .filter((bucket) => selectedKeys.has(bucket.bucketKey))
    .reduce((sum, bucket) => sum + bucket.plannedCount, 0)

  const hasNoUsableModel = !isModelsPending && availableModels.length === 0

  const summaryData: RefillSummaryData = {
    selectedBuckets: selectedKeys.size,
    plannedItems: plannedQuestions,
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
      engLevels,
      quizTypes,
      topicIds,
      audience: toBucketAudience(audience),
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
            title="Model sinh câu"
            description="Mỗi bucket chọn ngẫu nhiên một model trong số đã tick."
            className="pb-6"
          >
            <RefillModelPicker
              models={availableModels}
              value={models}
              isPending={isModelsPending}
              disabled={isPending}
              emptyDescription="Refill thủ công cần ít nhất một model đang bật và cho phép chạy thủ công."
              onChange={setModels}
            />
            <FieldDescription>
              {isModelsError
                ? "Không tải được danh sách model. Bỏ trống sẽ dùng mọi model đang bật chạy thủ công."
                : "Bỏ trống = mọi model đang bật chạy thủ công."}
            </FieldDescription>
          </RefillSection>

          <RefillSection
            title="Phạm vi & số lượng"
            description="Quyết định mỗi bucket được sinh thêm bao nhiêu câu."
            className="py-6"
          >
            <RefillScopeFields
              idPrefix="pool-refill"
              scopeMeta={MANUAL_REFILL_SCOPE_META}
              scope={scope}
              countLabel="Số câu mỗi bucket"
              count={countPerBucket}
              isCountInvalid={isCountInvalid}
              disabled={isPending}
              onScopeChange={(value) => setScope(value as ManualRefillScope)}
              onCountChange={setCountPerBucket}
            />
          </RefillSection>

          <RefillSection
            title="Lọc bucket"
            description="Thu hẹp theo từng chiều. Chiều nào bỏ trống thì không lọc."
            className="gap-5 py-6"
          >
            <Field>
              <FieldLabel>Đối tượng</FieldLabel>
              <AudienceToggle
                value={audience}
                disabled={isPending}
                onChange={changeAudience}
              />
              <FieldDescription>
                Người mới = bucket A1–B1, tối đa 4 đáp án, chỉ chủ đề bật cho
                người mới.
              </FieldDescription>
            </Field>

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
                    disabled={
                      audience === "beginner" &&
                      !BEGINNER_LEVELS.includes(level)
                    }
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
          </RefillSection>

          <RefillSection
            title="Bucket sẽ refill"
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
              emptyDescription="Nới bộ lọc cấp độ, chủ đề hoặc loại quiz để chọn được bucket."
              onRetry={() => void preview.refetch()}
              onToggleBuckets={toggleBuckets}
              onToggleAll={toggleAllBuckets}
            />
            {/* Cảnh báo chi phí nằm cạnh nút chạy ở rail desktop, còn ở mobile thanh
              đáy quá hẹp nên đặt ngay cuối danh sách. */}
            <div className="lg:hidden">
              <CostWarning plannedItems={plannedQuestions} copy={COPY} />
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

      {/* Nằm NGOÀI grid: `sticky bottom-0` bám theo containing block, mà grid area
          của một ô chỉ cao bằng chính nó nên đặt trong grid sẽ không dính được.
          Là con cuối của panel tab (cao hơn viewport) thì mới có khoảng để nổi lên. */}
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
