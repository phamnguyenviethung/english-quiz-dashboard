import { useEffect, useState } from "react"
import {
  IconDeviceFloppy,
  IconPencil,
  IconTrash,
  IconX,
} from "@tabler/icons-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { OPTIONS_PER_QUESTION } from "../constants.ts"
import {
  useDeleteReadingQuestion,
  useUpdateReadingQuestion,
} from "../hooks/use-mutate-reading-question.ts"
import type { ReadingQuestion } from "../types.ts"
import { ReadingQuestionBody } from "./reading-question-body.tsx"

interface Draft {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

function toDraft(question: ReadingQuestion): Draft {
  return {
    question: question.question,
    options: [...question.options],
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  }
}

/** Khớp validate của API: đúng 4 đáp án không rỗng, correctAnswer nằm trong bộ MỚI. */
function validateDraft(draft: Draft): string | undefined {
  if (draft.question.trim().length === 0) return "Chưa nhập câu hỏi."
  if (draft.explanation.trim().length === 0) return "Chưa nhập giải thích."

  const filled = draft.options.filter((option) => option.trim().length > 0)
  if (filled.length !== OPTIONS_PER_QUESTION) {
    return `Cần đúng ${OPTIONS_PER_QUESTION} đáp án, không được để trống.`
  }

  const unique = new Set(filled.map((option) => option.trim().toLowerCase()))
  if (unique.size !== filled.length) return "Các đáp án không được trùng nhau."

  if (draft.correctAnswer < 0 || draft.correctAnswer >= draft.options.length) {
    return "Đáp án đúng không hợp lệ."
  }

  return undefined
}

export function ReadingQuestionCard({
  question,
  index,
  className,
}: {
  question: ReadingQuestion
  index?: number
  className?: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => toDraft(question))
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setIsEditing(false)
    setDraft(toDraft(question))
  }, [question])

  const { updateQuestion, setActive, isPending } = useUpdateReadingQuestion({
    onSuccess: () => setIsEditing(false),
  })
  const { deleteQuestion, isPending: isDeleting } = useDeleteReadingQuestion()

  const validationError = validateDraft(draft)

  const handleSave = () =>
    void updateQuestion(question.id, {
      question: draft.question.trim(),
      options: draft.options.map((option) => option.trim()),
      correctAnswer: draft.correctAnswer,
      explanation: draft.explanation.trim(),
    })

  const setOption = (optionIndex: number, value: string) =>
    setDraft((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === optionIndex ? value : option
      ),
    }))

  return (
    <div
      className={cn(
        "space-y-4",
        !question.isActive && !isEditing && "opacity-60",
        className
      )}
    >
      {isEditing ? (
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor={`question-${question.id}`}>Câu hỏi</FieldLabel>
            <Textarea
              id={`question-${question.id}`}
              rows={2}
              value={draft.question}
              disabled={isPending}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, question: event.target.value }))
              }
            />
          </Field>

          <Field>
            <FieldLabel>Đáp án</FieldLabel>
            <RadioGroup
              value={String(draft.correctAnswer)}
              disabled={isPending}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  correctAnswer: Number(value),
                }))
              }
            >
              {draft.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={String(optionIndex)}
                    id={`option-${question.id}-${optionIndex}`}
                    aria-label={`Đáp án đúng là ${String.fromCharCode(65 + optionIndex)}`}
                  />
                  <span className="font-mono text-xs text-muted-foreground">
                    {String.fromCharCode(65 + optionIndex)}.
                  </span>
                  <Input
                    value={option}
                    disabled={isPending}
                    onChange={(event) =>
                      setOption(optionIndex, event.target.value)
                    }
                  />
                </div>
              ))}
            </RadioGroup>
            <FieldDescription>Chấm tròn đánh dấu đáp án đúng.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor={`explanation-${question.id}`}>
              Giải thích
            </FieldLabel>
            <Textarea
              id={`explanation-${question.id}`}
              rows={2}
              value={draft.explanation}
              disabled={isPending}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  explanation: event.target.value,
                }))
              }
            />
            <FieldDescription>
              {validationError ??
                "Một câu tiếng Việt, trỏ tới đoạn chứa dẫn chứng."}
            </FieldDescription>
          </Field>
        </div>
      ) : (
        <ReadingQuestionBody question={question} index={index} />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {isEditing ? (
          <>
            <Button
              size="sm"
              disabled={isPending || validationError !== undefined}
              onClick={handleSave}
            >
              <IconDeviceFloppy stroke={1.5} data-icon="inline-start" />
              Lưu
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setIsEditing(false)
                setDraft(toDraft(question))
              }}
            >
              <IconX stroke={1.5} data-icon="inline-start" />
              Huỷ
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <IconPencil stroke={1.5} data-icon="inline-start" />
              Sửa
            </Button>
            {question.isActive ? null : <Badge variant="outline">Đã tắt</Badge>}
          </>
        )}

        <label className="ml-auto flex items-center gap-2 text-sm">
          <Switch
            checked={question.isActive}
            disabled={isPending}
            onCheckedChange={(checked) => void setActive(question.id, checked)}
          />
          {question.isActive ? "Đang bật" : "Đã tắt"}
        </label>

        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          disabled={isDeleting}
          onClick={() => setConfirmDelete(true)}
        >
          <IconTrash stroke={1.5} data-icon="inline-start" />
          Xoá
        </Button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá câu hỏi này?</AlertDialogTitle>
            <AlertDialogDescription>
              Xoá hẳn, không khôi phục được. Bài đọc sẽ bị coi là thiếu câu và
              được sinh bù ở lần chạy sau. Nếu chỉ muốn ngừng dùng thì tắt câu
              thay vì xoá.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => void deleteQuestion(question.id)}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
