import { useState } from "react"
import { IconPencil } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateTopic } from "@/features/beginner/hooks/use-update-topic.ts"

import type { Topic } from "../hooks/use-topics.ts"

const DISPLAY_NAME_MAX = 64
const DESCRIPTION_MAX = 500

function toValues(topic: Topic) {
  return {
    displayName: topic.displayName ?? "",
    description: topic.description ?? "",
    forBeginner: topic.forBeginner,
  }
}

export function EditTopicDialog({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState(() => toValues(topic))
  const { updateTopic, isPending } = useUpdateTopic()

  const displayNameError =
    values.displayName.trim().length > DISPLAY_NAME_MAX
      ? `Tên hiển thị tối đa ${DISPLAY_NAME_MAX} ký tự.`
      : undefined
  const descriptionError =
    values.description.trim().length > DESCRIPTION_MAX
      ? `Mô tả tối đa ${DESCRIPTION_MAX} ký tự.`
      : undefined

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) setValues(toValues(topic))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (displayNameError || descriptionError) return

    const displayName = values.displayName.trim()
    const description = values.description.trim()
    const updated = await updateTopic(
      topic.id,
      {
        displayName: displayName || null,
        description: description || null,
        forBeginner: values.forBeginner,
      },
      {
        title: "Đã cập nhật chủ đề",
        description: `"${displayName || topic.name}" đã được lưu.`,
      }
    )
    if (updated) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Sửa chủ đề ${topic.name}`}
          >
            <IconPencil stroke={1.5} />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa chủ đề</DialogTitle>
          <DialogDescription>
            Tên gốc <code className="font-mono">{topic.name}</code> không đổi
            được vì đang dùng làm khoá trong prompt.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <Field data-invalid={Boolean(displayNameError)}>
            <FieldLabel htmlFor={`topic-${topic.id}-display-name`}>
              Tên hiển thị
            </FieldLabel>
            <Input
              id={`topic-${topic.id}-display-name`}
              placeholder={topic.name}
              value={values.displayName}
              onChange={(event) =>
                setValues({ ...values, displayName: event.target.value })
              }
              aria-invalid={Boolean(displayNameError)}
              autoComplete="off"
              disabled={isPending}
            />
            <FieldError
              errors={[
                displayNameError ? { message: displayNameError } : undefined,
              ]}
            />
          </Field>

          <Field data-invalid={Boolean(descriptionError)}>
            <FieldLabel htmlFor={`topic-${topic.id}-description`}>
              Mô tả
            </FieldLabel>
            <Textarea
              id={`topic-${topic.id}-description`}
              rows={3}
              value={values.description}
              onChange={(event) =>
                setValues({ ...values, description: event.target.value })
              }
              aria-invalid={Boolean(descriptionError)}
              disabled={isPending}
            />
            <FieldError
              errors={[
                descriptionError ? { message: descriptionError } : undefined,
              ]}
            />
          </Field>

          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor={`topic-${topic.id}-beginner`}>
                Dành cho người mới
              </FieldLabel>
              <FieldDescription>
                Sinh thêm câu hỏi và bài đọc A1–B1, tối đa 4 đáp án cho chủ đề
                này.
              </FieldDescription>
            </FieldContent>
            <Switch
              id={`topic-${topic.id}-beginner`}
              checked={values.forBeginner}
              disabled={isPending}
              onCheckedChange={(checked) =>
                setValues({ ...values, forBeginner: checked })
              }
            />
          </Field>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Huỷ
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
