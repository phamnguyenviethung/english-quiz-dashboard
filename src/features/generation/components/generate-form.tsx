import type { FormEvent } from "react"
import { IconSparkles } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  BEGINNER_LEVELS,
  BEGINNER_MAX_OPTIONS,
} from "@/features/beginner/constants.ts"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  ENG_LEVELS,
  formatOptionCountLabel,
} from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"
import {
  formatTopicLabel,
  useTopicNameOptions,
} from "@/features/topics/hooks/use-topics.ts"

import {
  GENERATE_OPTION_COUNTS,
  GENERATE_QUIZ_TYPES,
  GENERATE_TYPE_META,
  MAX_EXCLUDE_WORDS,
  NO_TOPIC_LABEL,
  NO_TOPIC_VALUE,
  READING_QUIZ_TYPE,
} from "../constants.ts"
import type {
  GenerateFormErrors,
  GenerateFormValues,
  GenerateOptionCount,
  GenerateQuizType,
} from "../types.ts"

export function GenerateForm({
  values,
  errors,
  isPending,
  onChange,
  onSubmit,
}: {
  values: GenerateFormValues
  errors: GenerateFormErrors
  isPending: boolean
  onChange: (patch: Partial<GenerateFormValues>) => void
  onSubmit: () => void
}) {
  const { topics, items, isPending: isTopicsPending } = useTopicNameOptions()
  const isReading = values.quizType === READING_QUIZ_TYPE
  const isBeginner = values.forBeginner && !isReading

  // Beginner chỉ có A1–B1 và tối đa 4 đáp án — ép về giá trị hợp lệ khi bật.
  const toggleBeginner = (checked: boolean) =>
    onChange({
      forBeginner: checked,
      ...(checked && !BEGINNER_LEVELS.includes(values.engLevel)
        ? { engLevel: "B1" }
        : {}),
      ...(checked && values.optionCount > BEGINNER_MAX_OPTIONS
        ? { optionCount: BEGINNER_MAX_OPTIONS }
        : {}),
    })

  const quizTypeItems = Object.fromEntries(
    GENERATE_QUIZ_TYPES.map((type) => [type, GENERATE_TYPE_META[type].label])
  )
  const levelItems = Object.fromEntries(
    ENG_LEVELS.map((level) => [level, level])
  )
  const optionCountItems = Object.fromEntries(
    GENERATE_OPTION_COUNTS.map((count) => [
      String(count),
      formatOptionCountLabel(count),
    ])
  )
  const topicItems = { [NO_TOPIC_VALUE]: NO_TOPIC_LABEL, ...items }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border p-4"
    >
      <Field>
        <FieldLabel htmlFor="generate-quiz-type">Loại câu hỏi</FieldLabel>
        <Select
          items={quizTypeItems}
          value={values.quizType}
          onValueChange={(value) =>
            onChange({ quizType: value as GenerateQuizType })
          }
        >
          <SelectTrigger id="generate-quiz-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GENERATE_QUIZ_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {GENERATE_TYPE_META[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {isReading ? null : (
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="generate-for-beginner">
              Prompt cho người mới
            </FieldLabel>
            <FieldDescription>
              Tối đa B1, 4 đáp án, từ vựng thường ngày. Loại câu phải đang bật
              cho người mới.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="generate-for-beginner"
            checked={values.forBeginner}
            onCheckedChange={toggleBeginner}
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="generate-eng-level">Cấp độ</FieldLabel>
          <Select
            items={levelItems}
            value={values.engLevel}
            onValueChange={(value) => onChange({ engLevel: value as EngLevel })}
          >
            <SelectTrigger id="generate-eng-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENG_LEVELS.map((level) => (
                <SelectItem
                  key={level}
                  value={level}
                  disabled={isBeginner && !BEGINNER_LEVELS.includes(level)}
                >
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="generate-option-count">Số đáp án</FieldLabel>
          <Select
            items={optionCountItems}
            value={String(values.optionCount)}
            onValueChange={(value) =>
              onChange({ optionCount: Number(value) as GenerateOptionCount })
            }
          >
            <SelectTrigger id="generate-option-count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENERATE_OPTION_COUNTS.map((count) => (
                <SelectItem
                  key={count}
                  value={String(count)}
                  disabled={isBeginner && count > BEGINNER_MAX_OPTIONS}
                >
                  {formatOptionCountLabel(count)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="generate-topic">Chủ đề</FieldLabel>
        {isTopicsPending ? (
          <Skeleton className="h-9 w-full rounded-3xl" />
        ) : (
          <Select
            items={topicItems}
            value={values.topic || NO_TOPIC_VALUE}
            onValueChange={(value) =>
              onChange({
                topic: !value || value === NO_TOPIC_VALUE ? "" : value,
              })
            }
            disabled={isReading}
          >
            <SelectTrigger id="generate-topic">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_TOPIC_VALUE}>{NO_TOPIC_LABEL}</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.name}>
                  {formatTopicLabel(topic)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Field>

      <Field data-invalid={Boolean(errors.model)}>
        <FieldLabel htmlFor="generate-model">Model</FieldLabel>
        <Input
          id="generate-model"
          value={values.model}
          placeholder="Mặc định theo cấu hình"
          onChange={(event) => onChange({ model: event.target.value })}
          aria-invalid={Boolean(errors.model)}
          disabled={isPending}
        />
        <FieldError
          errors={[errors.model ? { message: errors.model } : undefined]}
        />
      </Field>

      <Field data-invalid={Boolean(errors.excludeWords)}>
        <FieldLabel htmlFor="generate-exclude-words">Từ loại trừ</FieldLabel>
        <Textarea
          id="generate-exclude-words"
          rows={3}
          value={values.excludeWords}
          placeholder={`Cách nhau bằng dấu phẩy hoặc xuống dòng, tối đa ${MAX_EXCLUDE_WORDS} từ`}
          onChange={(event) => onChange({ excludeWords: event.target.value })}
          aria-invalid={Boolean(errors.excludeWords)}
          disabled={isPending || isReading}
        />
        <FieldError
          errors={[
            errors.excludeWords ? { message: errors.excludeWords } : undefined,
          ]}
        />
      </Field>

      {isReading ? (
        <p className="text-xs text-muted-foreground">
          Reading không nhận chủ đề và danh sách từ loại trừ.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <IconSparkles stroke={1.5} data-icon="inline-start" />
        )}
        Tạo câu hỏi
      </Button>
    </form>
  )
}
