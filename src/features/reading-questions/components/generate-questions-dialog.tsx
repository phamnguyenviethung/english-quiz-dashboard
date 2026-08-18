import { useState } from "react"
import { IconSparkles } from "@tabler/icons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useReadingGenerationModels } from "@/features/readings/hooks/use-reading-models.ts"
import { getApiErrorMessage } from "@/lib/api-error.ts"
import { formatNumber } from "@/lib/format.ts"

import { ALL_VALUE, getReadingQuestionTypeLabel } from "../constants.ts"
import { useGenerateReadingQuestions } from "../hooks/use-generate-reading-questions.ts"
import { ReadingQuestionBody } from "./reading-question-body.tsx"

/**
 * Sinh thử trọn bộ câu hỏi cho 1 bài để soi prompt/model. Kết quả KHÔNG được lưu.
 * Model dùng chung pool `reading` với bài đọc nên tái sử dụng hook bên readings.
 */
export function GenerateQuestionsDialog({
  passageId,
  passageTitle,
  cefrLevel,
  open,
  onOpenChange,
}: {
  passageId: number
  passageTitle: string
  cefrLevel: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { models } = useReadingGenerationModels()
  const { generate, questions, usage, isPending, isError, error, reset } =
    useGenerateReadingQuestions()

  const [model, setModel] = useState<string>(ALL_VALUE)

  const handleSubmit = () => {
    reset()
    void generate(passageId, model === ALL_VALUE ? undefined : model).catch(
      () => {
        // Lỗi đã hiển thị qua isError bên dưới; nuốt ở đây để không thành unhandled rejection.
      }
    )
  }

  const distinctTypes = new Set(questions?.map((item) => item.quizType))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sinh thử câu hỏi</DialogTitle>
          <DialogDescription>
            Dùng để kiểm tra prompt và model cho bài "{passageTitle}". Câu hỏi
            tạo ra ở đây <strong>không được lưu vào kho</strong> — muốn lưu thì
            dùng "Sinh hàng loạt".
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="generate-questions-model">Model</FieldLabel>
          <Select
            value={model}
            disabled={isPending}
            onValueChange={(value) => setModel(value ?? ALL_VALUE)}
          >
            <SelectTrigger id="generate-questions-model">
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
            Chỉ hiện model đang bật cho reading. Loại câu hỏi bị giới hạn theo
            cấp độ {cefrLevel} của bài.
          </FieldDescription>
        </Field>

        <Button disabled={isPending} onClick={handleSubmit}>
          <IconSparkles stroke={1.5} data-icon="inline-start" />
          {isPending ? "Đang sinh…" : "Sinh câu hỏi"}
        </Button>

        {isError ? (
          <Alert variant="destructive">
            <AlertTitle>Không sinh được câu hỏi</AlertTitle>
            <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
          </Alert>
        ) : null}

        {isPending ? (
          <div className="space-y-3 rounded-2xl border p-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-5 rounded-2xl border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{cefrLevel}</Badge>
              <span className="text-sm text-muted-foreground">
                {questions.length} câu · {distinctTypes.size} loại
              </span>
              {usage ? (
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {formatNumber(usage.inputTokens)} vào ·{" "}
                  {formatNumber(usage.outputTokens)} ra · {usage.model}
                </span>
              ) : null}
            </div>

            {questions.map((question, index) => (
              <ReadingQuestionBody
                key={index}
                question={question}
                index={index}
                className="border-t pt-4 first:border-t-0 first:pt-0"
              />
            ))}

            <p className="text-xs text-muted-foreground">
              Loại đã dùng:{" "}
              {[...distinctTypes]
                .map((type) => getReadingQuestionTypeLabel(type))
                .join(", ")}
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
