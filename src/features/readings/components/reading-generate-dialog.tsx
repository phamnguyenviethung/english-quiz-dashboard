import { useState } from "react"
import { IconSparkles } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ENG_LEVELS } from "@/features/quiz/constants.ts"
import type { EngLevel } from "@/features/quiz/types.ts"
import { useTopics } from "@/features/topics/hooks/use-topics.ts"
import { formatNumber } from "@/lib/format.ts"

import { ALL_VALUE, getWordBand } from "../constants.ts"
import { useGenerateReading } from "../hooks/use-generate-reading.ts"
import { useReadingGenerationModels } from "../hooks/use-reading-models.ts"
import { WordCountBadge } from "./word-count-badge.tsx"

const DEFAULT_LEVEL: EngLevel = "B1"

/**
 * Sinh thử 1 bài để soi prompt/model. Bài KHÔNG được lưu — nhấn mạnh trong mô tả
 * để admin không tưởng nhầm là đã vào kho.
 */
export function ReadingGenerateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { topics, isPending: isTopicsPending } = useTopics()
  const { models } = useReadingGenerationModels()
  const { generate, passage, usage, isPending, reset } = useGenerateReading()

  const [topicName, setTopicName] = useState("")
  const [cefrLevel, setCefrLevel] = useState<EngLevel>(DEFAULT_LEVEL)
  const [model, setModel] = useState<string>(ALL_VALUE)

  const band = getWordBand(cefrLevel)
  const isSubmitDisabled = isPending || topicName.trim().length === 0

  const handleSubmit = () => {
    reset()
    void generate({
      topicName,
      cefrLevel,
      ...(model === ALL_VALUE ? {} : { model }),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tạo thử một bài đọc</DialogTitle>
          <DialogDescription>
            Dùng để kiểm tra prompt và model. Bài tạo ra ở đây{" "}
            <strong>không được lưu vào kho</strong> — muốn lưu thì dùng "Sinh
            hàng loạt".
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field className="sm:col-span-3">
            <FieldLabel htmlFor="generate-topic">Chủ đề</FieldLabel>
            <Input
              id="generate-topic"
              list="reading-topic-suggestions"
              placeholder="VD: Food, Travel, Daily routine…"
              value={topicName}
              disabled={isPending}
              onChange={(event) => setTopicName(event.target.value)}
            />
            {/* Gợi ý từ topic đã có nhưng vẫn cho gõ tự do: đây là màn thử nghiệm,
                admin có thể muốn test một chủ đề chưa tạo trong hệ thống. */}
            <datalist id="reading-topic-suggestions">
              {isTopicsPending
                ? null
                : topics.map((topic) => (
                    <option key={topic.id} value={topic.name} />
                  ))}
            </datalist>
            <FieldDescription>
              Chủ đề được khoá cứng trong prompt — bài viết ra phải thuộc đúng
              chủ đề này.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="generate-level">Cấp độ</FieldLabel>
            <Select
              value={cefrLevel}
              disabled={isPending}
              onValueChange={(value) => setCefrLevel(value as EngLevel)}
            >
              <SelectTrigger id="generate-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENG_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              {band ? `Độ dài mục tiêu ${band.min}-${band.max} từ.` : ""}
            </FieldDescription>
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="generate-model">Model</FieldLabel>
            <Select
              value={model}
              disabled={isPending}
              onValueChange={(value) => setModel(value ?? ALL_VALUE)}
            >
              <SelectTrigger id="generate-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Tự chọn ngẫu nhiên</SelectItem>
                {models.map((item) => (
                  <SelectItem key={item.id} value={item.modelId}>
                    {item.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Chỉ hiện model đang bật cho reading.
            </FieldDescription>
          </Field>
        </div>

        <Button disabled={isSubmitDisabled} onClick={handleSubmit}>
          <IconSparkles stroke={1.5} data-icon="inline-start" />
          {isPending ? "Đang tạo…" : "Tạo bài đọc"}
        </Button>

        {isPending ? (
          <div className="space-y-3 rounded-2xl border p-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : passage ? (
          <div className="space-y-4 rounded-2xl border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{passage.cefrLevel}</Badge>
              <WordCountBadge
                cefrLevel={passage.cefrLevel}
                wordCount={passage.wordCount}
              />
              <span className="text-sm text-muted-foreground">
                {passage.topic}
              </span>
              {usage ? (
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {formatNumber(usage.inputTokens)} vào ·{" "}
                  {formatNumber(usage.outputTokens)} ra · {usage.model}
                </span>
              ) : null}
            </div>

            <h3 className="text-lg font-semibold tracking-tight">
              {passage.title}
            </h3>
            {passage.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-[15px] leading-7">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
