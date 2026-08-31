import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
import { ENG_LEVELS, getQuizTypeLabel } from "@/features/quiz/constants.ts"
import type { EngLevel, QuizType } from "@/features/quiz/types.ts"

import {
  SIBLING_REFILL_COST_WARNING,
  SIBLING_REFILL_SCOPE_META,
  SIBLING_SUPPORTED_QUIZ_TYPES,
} from "../constants.ts"
import { useManualRefillModels } from "../hooks/use-manual-refill-models.ts"
import { useSiblingBuckets } from "../hooks/use-sibling-buckets.ts"
import { useSiblingRefill } from "../hooks/use-sibling-refill.ts"
import type { SiblingRefillScope } from "../types.ts"

const INITIAL_SCOPE: SiblingRefillScope = "deficient"

const COPY: RefillCopy = {
  unit: "câu tương tự",
  plannedStatLabel: "Câu tương tự sẽ sinh",
  confirmTitle: "Chạy sinh câu tương tự?",
  confirmAction: "Chạy",
  wideOpenModelLabel: "mọi model đang bật chạy thủ công",
  costWarningThreshold: SIBLING_REFILL_COST_WARNING,
}

const SIBLING_QUIZ_TYPES = SIBLING_SUPPORTED_QUIZ_TYPES as readonly QuizType[]

function parsePositiveInt(raw: string): {
  value: number | undefined
  invalid: boolean
} {
  if (raw.trim() === "") return { value: undefined, invalid: false }
  const parsed = Number(raw)
  const invalid = !Number.isInteger(parsed) || parsed < 1
  return { value: invalid ? undefined : parsed, invalid }
}

export function SiblingRefillPage() {
  const navigate = useNavigate()

  const [scope, setScope] = useState<SiblingRefillScope>(INITIAL_SCOPE)
  const [sourcesPerBucketInput, setSourcesPerBucketInput] = useState("")
  const [siblingsPerSourceInput, setSiblingsPerSourceInput] = useState("")
  const [models, setModels] = useState<string[]>([])
  const [engLevels, setEngLevels] = useState<EngLevel[]>([])
  const [quizTypes, setQuizTypes] = useState<QuizType[]>([])
  const [topicIds, setTopicIds] = useState<number[]>([])
  const [deselectedKeys, setDeselectedKeys] = useState<Set<string>>(new Set())

  const sources = parsePositiveInt(sourcesPerBucketInput)
  const siblings = parsePositiveInt(siblingsPerSourceInput)
  const isSiblingsTooHigh = siblings.value !== undefined && siblings.value > 5
  const isSourcesInvalid = sources.invalid
  const isSiblingsInvalid = siblings.invalid || isSiblingsTooHigh

  const {
    models: availableModels,
    isPending: isModelsPending,
    isError: isModelsError,
  } = useManualRefillModels()

  const preview = useSiblingBuckets(
    {
      scope,
      engLevels,
      quizTypes,
      topicIds,
      ...(isSourcesInvalid ? {} : { sourcesPerBucket: sources.value }),
      ...(isSiblingsInvalid ? {} : { siblingsPerSource: siblings.value }),
    },
    true
  )

  const { startRefill, isPending } = useSiblingRefill({
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

  const plannedSiblings = bucketViews
    .filter((bucket) => selectedKeys.has(bucket.bucketKey))
    .reduce((sum, bucket) => sum + bucket.plannedCount, 0)

  const hasNoUsableModel = !isModelsPending && availableModels.length === 0

  const summaryData: RefillSummaryData = {
    selectedBuckets: selectedKeys.size,
    plannedItems: plannedSiblings,
    modelCount: models.length,
    isModelPoolWideOpen: models.length === 0,
  }

  const isSubmitDisabled =
    isPending ||
    isSourcesInvalid ||
    isSiblingsInvalid ||
    hasNoUsableModel ||
    selectedKeys.size === 0

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
      ...(sources.value === undefined
        ? {}
        : { sourcesPerBucket: sources.value }),
      ...(siblings.value === undefined
        ? {}
        : { siblingsPerSource: siblings.value }),
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
              emptyDescription="Cần ít nhất một model đang bật và cho phép chạy thủ công."
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
            description="Câu gốc phải là câu sinh mới (không phải câu tương tự)."
            className="gap-4 py-6"
          >
            <RefillScopeFields
              idPrefix="sibling-refill"
              scopeMeta={SIBLING_REFILL_SCOPE_META}
              scope={scope}
              disabled={isPending}
              showCount={false}
              onScopeChange={(value) => setScope(value as SiblingRefillScope)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={isSourcesInvalid || undefined}>
                <FieldLabel htmlFor="sibling-refill-sources">
                  Số câu gốc mỗi bucket
                </FieldLabel>
                <Input
                  id="sibling-refill-sources"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  className="min-h-11 tabular-nums lg:min-h-9"
                  placeholder="Mặc định"
                  value={sourcesPerBucketInput}
                  disabled={isPending}
                  aria-invalid={isSourcesInvalid}
                  onChange={(event) =>
                    setSourcesPerBucketInput(event.target.value)
                  }
                />
                <FieldDescription>
                  {isSourcesInvalid
                    ? "Nhập số nguyên từ 1 trở lên."
                    : "Bỏ trống để dùng cấu hình hệ thống."}
                </FieldDescription>
              </Field>

              <Field data-invalid={isSiblingsInvalid || undefined}>
                <FieldLabel htmlFor="sibling-refill-siblings">
                  Số câu tương tự mỗi câu gốc
                </FieldLabel>
                <Input
                  id="sibling-refill-siblings"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={5}
                  step={1}
                  className="min-h-11 tabular-nums lg:min-h-9"
                  placeholder="Mặc định"
                  value={siblingsPerSourceInput}
                  disabled={isPending}
                  aria-invalid={isSiblingsInvalid}
                  onChange={(event) =>
                    setSiblingsPerSourceInput(event.target.value)
                  }
                />
                <FieldDescription>
                  {isSiblingsInvalid
                    ? "Nhập số nguyên từ 1 đến 5."
                    : "Tối đa 5. Bỏ trống để dùng cấu hình hệ thống."}
                </FieldDescription>
              </Field>
            </div>
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
                {SIBLING_QUIZ_TYPES.map((quizType) => (
                  <ToggleGroupItem
                    key={quizType}
                    value={quizType}
                    className={TOUCH_TOGGLE}
                  >
                    {getQuizTypeLabel(quizType)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FieldDescription>
                Chỉ 9 loại hỗ trợ sinh câu tương tự. {BUCKET_FILTER_ALL_HINT}
              </FieldDescription>
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
            title="Bucket sẽ sinh câu tương tự"
            description="Bucket không có câu gốc sẽ bị bỏ qua. Mở một chủ đề để bỏ tick từng bucket."
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
              emptyDescription="Nới bộ lọc, hoặc chưa có câu gốc nào trong các bucket khớp filter."
              onRetry={() => void preview.refetch()}
              onToggleBuckets={toggleBuckets}
              onToggleAll={toggleAllBuckets}
            />
            <div className="lg:hidden">
              <CostWarning plannedItems={plannedSiblings} copy={COPY} />
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
