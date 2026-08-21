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
  RefillBucketSummaryView,
  RefillBucketView,
  RefillCopy,
  RefillSummaryData,
} from "@/features/refill/types.ts"
import { ENG_LEVELS } from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"
import { useReadingGenerationModels } from "@/features/readings/hooks/use-reading-models.ts"

import {
  READING_QUESTION_REFILL_MODE_META,
  REFILL_COST_WARNING_QUESTIONS,
} from "../constants.ts"
import { useReadingQuestionBuckets } from "../hooks/use-reading-question-buckets.ts"
import { useReadingQuestionRefill } from "../hooks/use-reading-question-refill.ts"
import type { ReadingQuestionRefillMode } from "../types.ts"

const INITIAL_MODE: ReadingQuestionRefillMode = "deficient"

const COPY: RefillCopy = {
  unit: "câu",
  plannedStatLabel: "Câu sẽ sinh",
  confirmTitle: "Sinh câu hỏi?",
  confirmAction: "Bắt đầu sinh",
  wideOpenModelLabel: "mọi model đang bật cho reading",
  costWarningThreshold: REFILL_COST_WARNING_QUESTIONS,
}

export function ReadingQuestionRefillPage() {
  const navigate = useNavigate()

  const [mode, setMode] = useState<ReadingQuestionRefillMode>(INITIAL_MODE)
  const [models, setModels] = useState<string[]>([])
  const [cefrLevels, setCefrLevels] = useState<EngLevel[]>([])
  const [topicIds, setTopicIds] = useState<number[]>([])
  // Lưu bài bị BỎ tick chứ không phải bài được tick: khi nới bộ lọc, bài mới về
  // mặc định vẫn được chọn thay vì im lặng bị bỏ sót.
  const [deselectedKeys, setDeselectedKeys] = useState<Set<string>>(new Set())

  const {
    models: availableModels,
    isPending: isModelsPending,
    isError: isModelsError,
  } = useReadingGenerationModels()

  const preview = useReadingQuestionBuckets(
    { mode, cefrLevels, topicIds, passageIds: [] },
    true
  )

  const { startRefill, isPending } = useReadingQuestionRefill({
    onStarted: (runId) => {
      void navigate(
        runId ? { to: "/cron-runs", search: { runId } } : { to: "/cron-runs" }
      )
    },
  })

  // Bucket ở đây là 1 bài đọc, nên nhiều dòng có thể trùng chủ đề + cấp độ.
  // `variantLabel` (ô pool dùng cho quizType) mang tiêu đề bài để phân biệt.
  const bucketViews = useMemo<RefillBucketView[]>(
    () =>
      preview.buckets.map((bucket) => ({
        bucketKey: bucket.bucketKey,
        topicId: bucket.topicId,
        topicName: bucket.topicName,
        level: bucket.cefrLevel,
        currentCount: bucket.currentCount,
        plannedCount: bucket.plannedCount,
        variantLabel: bucket.title,
      })),
    [preview.buckets]
  )

  // API câu hỏi đặt tên field theo "bài"/"câu", kit dùng chung nói "bucket".
  const summaryView = useMemo<RefillBucketSummaryView>(
    () => ({
      matchedBuckets: preview.summary.matchedPassages,
      plannedBuckets: preview.summary.plannedPassages,
      maxPerBucket: preview.summary.questionsPerPassage,
    }),
    [preview.summary]
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
    isPending || hasNoUsableModel || selectedKeys.size === 0

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
      mode,
      models,
      cefrLevels,
      topicIds,
      passageIds: [],
      ...(isFullSelection ? {} : { bucketKeys: [...selectedKeys] }),
    })
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex flex-col divide-y">
          <RefillSection
            title="Model sinh câu hỏi"
            description="Mỗi bài chọn ngẫu nhiên một model trong số đã tick."
            className="pb-6"
          >
            <RefillModelPicker
              models={availableModels}
              value={models}
              isPending={isModelsPending}
              disabled={isPending}
              emptyDescription="Sinh câu hỏi cần ít nhất một model đang bật và cho phép sinh reading."
              onChange={setModels}
            />
            <FieldDescription>
              {isModelsError
                ? "Không tải được danh sách model. Bỏ trống sẽ dùng mọi model đang bật cho reading."
                : "Bỏ trống = mọi model đang bật cho reading."}
            </FieldDescription>
          </RefillSection>

          <RefillSection
            title="Phạm vi"
            description="Quyết định bài nào được sinh câu hỏi."
            className="py-6"
          >
            <RefillScopeFields
              idPrefix="reading-question-refill"
              scopeMeta={READING_QUESTION_REFILL_MODE_META}
              scope={mode}
              showCount={false}
              disabled={isPending}
              onScopeChange={(value) =>
                setMode(value as ReadingQuestionRefillMode)
              }
            />
            <FieldDescription>
              Số câu mỗi bài lấy từ cấu hình
              <span className="font-mono text-xs">
                {" "}
                reading_question.questionsPerPassage
              </span>
              , không chọn được từng lượt.
            </FieldDescription>
          </RefillSection>

          <RefillSection
            title="Lọc bài đọc"
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
            title="Bài sẽ sinh câu hỏi"
            description="Mở một chủ đề để bỏ tick từng bài cụ thể."
            className="py-6"
          >
            <RefillBucketGroups
              buckets={bucketViews}
              summary={summaryView}
              copy={COPY}
              selectedKeys={selectedKeys}
              isPending={preview.isPending}
              isStale={preview.isStale || preview.isFetching}
              isError={preview.isError}
              error={preview.error}
              emptyDescription="Mọi bài đã đủ câu hỏi, hoặc nới bộ lọc cấp độ và chủ đề. Bài sinh hỏng quá số lần cho phép cũng bị loại khỏi đây."
              onRetry={() => void preview.refetch()}
              onToggleBuckets={toggleBuckets}
              onToggleAll={toggleAllBuckets}
            />
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
